import '../style/index.less';

import BaseLayout from '@layouts/base-layout';
import { redirectLogin } from '@lib/utils';
import { loginSuccess } from '@redux/auth/actions';
import { updateSettings } from '@redux/settings/actions';
import { wrapper } from '@redux/store';
import { updateLiveStreamSettings } from '@redux/streaming/actions';
import { updateUIValue } from '@redux/ui/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { APIRequest } from '@services/api-request';
import {
  authService, settingService, userService
} from '@services/index';
import { pick } from 'lodash';
import { NextPageContext } from 'next';
import App from 'next/app';
import getConfig from 'next/config';
import Head from 'next/head';
import nextCookie from 'next-cookies';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import { Provider } from 'react-redux';
import { END } from 'redux-saga';
import { SETTING_KEYS } from 'src/constants';
import { Socket } from 'src/socket';

async function auth(
  ctx: NextPageContext,
  store,
  noredirect: boolean,
  onlyPerformer: boolean
) {
  try {
    const state = store.getState();
    const { token } = nextCookie(ctx);
    if (state.auth && state.auth.loggedIn) {
      return;
    }
    if (token) {
      authService.setToken(token);
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data.isPerformer && onlyPerformer) {
        redirectLogin(ctx);
        return;
      }
      store.dispatch(loginSuccess());
      store.dispatch(updateCurrentUser(user.data));
      return;
    }
    !noredirect && redirectLogin(ctx);
  } catch (e) {
    redirectLogin(ctx);
  }
}

async function loadUser(token, store) {
  try {
    authService.setToken(token);
    const user = await userService.me({
      Authorization: token
    });
    // TODO - check permission
    store.dispatch(loginSuccess());
    store.dispatch(updateCurrentUser(user.data));
  // eslint-disable-next-line no-empty
  } catch {}
}

async function updateSettingsStore(store, settings) {
  store.dispatch(
    updateUIValue({
      logo: settings.logoUrl,
      whiteLogo: settings.whiteLogoUrl,
      pageLoadingIcon: settings.pageLoadingIconUrl,
      siteName: settings.siteName,
      favicon: settings.favicon
    })
  );
  store.dispatch(
    updateLiveStreamSettings(
      pick(settings, [
        'viewerURL',
        'publisherURL',
        SETTING_KEYS.SUBSCRIBER_URL,
        'optionForBroadcast',
        'optionForPrivate',
        'optionForGroup',
        'secureOption',
        'AntMediaAppname'
      ])
    )
  );

  store.dispatch(
    updateSettings({
      ...settings
    })
  );
}

type IApplication = {
  Component: any;
  pageProps: any;
};

function Application({
  Component,
  ...rest
}: IApplication) {
  const { layout } = Component;
  const { store, props } = wrapper.useWrappedStore(rest);
  const state = store.getState();
  const ga = state.settings?.gaCode;
  return (
    <Provider store={store}>
      {ga && <GoogleAnalytics trackPageViews gaMeasurementId={ga} />}
      <Socket>
        <BaseLayout layout={layout}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          </Head>
          <Component {...props.pageProps} />
        </BaseLayout>
      </Socket>
    </Provider>
  );
}

Application.getInitialProps = wrapper.getInitialAppProps((store) => async (context) => {
  const { Component, ctx } = context;

  // NOTE - do not move this line to condition above, will theor error
  if (typeof window === 'undefined') {
    const { serverRuntimeConfig } = getConfig();
    APIRequest.API_ENDPOINT = serverRuntimeConfig.API_ENDPOINT;

    // server side to load settings, once time only
    const settings = await settingService.all('all', true);
    await updateSettingsStore(store, settings.data);
  }

  // won't check auth for un-authenticated page such as login, register
  // use static field in the component
  const { noredirect, authenticate, onlyPerformer } = Component as any;
  const { token } = nextCookie(ctx);
  if (authenticate) await auth(ctx, store, noredirect, onlyPerformer);
  else if (token) {
    // load user if needed
    await loadUser(token, store);
  }
  // Wait for all page actions to dispatch
  const pageProps = {
    // https://nextjs.org/docs/advanced-features/custom-app#caveats
    ...(await App.getInitialProps(context)).pageProps
  };

  // Stop the saga if on server
  if (typeof window === 'undefined') {
    store.dispatch(END);
    await (store as any).sagaTask.toPromise();
  }

  return {
    pageProps
  };
});

export default Application;
