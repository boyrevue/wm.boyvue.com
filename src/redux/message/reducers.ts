import { createReducers } from '@lib/redux';
import { merge, uniq } from 'lodash';
import { IMessage, IReduxAction } from 'src/interfaces';

import {
  deactiveConversation,
  fetchingMessage,
  getConversationDetailSuccess,
  getConversations,
  getConversationsFail,
  getConversationsSuccess,
  loadMessagesSuccess,
  loadMoreMessagesSuccess,
  onPinSuccess,
  readMessages,
  receiveMessageSuccess,
  resetConversationState,
  searchConversations,
  searchConversationsFail,
  searchConversationsSuccess,
  sendMessage,
  sendMessageFail,
  sendMessageSuccess,
  sentFileSuccess,
  setActiveConversationSuccess,
  updateTotalUnreadMessageInConversation
} from './actions';

const initialConversationState = {
  list: {
    requesting: false,
    error: null,
    data: [],
    total: 0,
    success: false
  },
  mapping: {},
  activeConversation: {}
};

const initialMessageState = {
  conversationMap: {},
  sendMessage: {},
  receiveMessage: {}
};

const conversationReducer = [
  {
    on: resetConversationState,
    reducer() {
      return {
        ...initialConversationState
      };
    }
  },
  {
    on: getConversations,
    reducer(state: any) {
      const nextState = { ...state };
      nextState.list.requesting = true;
      return {
        ...nextState
      };
    }
  },
  {
    on: getConversationsSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const nextState = { ...state };
      const { list, mapping } = nextState;
      const { data: items, total } = data.payload;
      const Ids = items.map((c) => c._id);
      list.data = uniq(list.data.concat(Ids));
      list.total = total;
      list.success = true;
      list.requesting = false;
      list.error = false;
      items.forEach((c) => {
        mapping[c._id] = c;
      });

      return {
        ...nextState
      };
    }
  },
  {
    on: getConversationsFail,
    reducer(state: any) {
      const nextState = { ...state };
      return {
        ...nextState,
        ...initialConversationState
      };
    }
  },
  {
    on: searchConversations,
    reducer(state: any) {
      const nextState = { ...state };
      return {
        ...nextState,
        list: {
          requesting: true,
          error: null,
          data: [],
          total: 0,
          success: false
        },
        mapping: {},
        activeConversation: {}
      };
    }
  },
  {
    on: searchConversationsSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const nextState = { ...state };
      const { list, mapping } = nextState;
      const { data: items, total } = data.payload;
      const Ids = items.map((c) => c._id);
      list.data = Ids;
      list.total = total;
      list.success = true;
      list.requesting = false;
      list.error = false;
      items.forEach((c) => {
        mapping[c._id] = c;
      });
      return {
        ...nextState
      };
    }
  },
  {
    on: searchConversationsFail,
    reducer(state: any, data: IReduxAction<any>) {
      const nextState = { ...state };
      return {
        ...nextState,
        list: {
          requesting: false,
          error: data.payload,
          data: [],
          total: 0,
          success: false
        },
        mapping: {},
        activeConversation: {}
      };
    }
  },
  {
    on: setActiveConversationSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const conversation = data.payload;
      const list = state.list.data;
      const { mapping } = state;
      const check = list.find((c) => c === conversation._id);
      if (!check) {
        list.unshift(conversation._id);
        mapping[conversation._id] = conversation;
      }
      return {
        ...state,
        activeConversation: conversation
      };
    }
  },
  {
    on: getConversationDetailSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const { list, mapping } = state;
      const conversation = data.payload;
      if (!list.data.includes(conversation._id)) {
        list.data.unshift(conversation._id);
        mapping[conversation._id] = conversation;
      }
      return {
        ...state
      };
    }
  },
  {
    on: readMessages,
    reducer(state: any, data: IReduxAction<any>) {
      const conversationId = data.payload;
      const { mapping } = state;
      mapping[conversationId].totalNotSeenMessages = 0;
      return {
        ...state
      };
    }
  },
  {
    on: deactiveConversation,
    reducer(state: any) {
      const nextState = { ...state };
      nextState.activeConversation = {};
      return {
        ...nextState
      };
    }
  },
  {
    on: onPinSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const nextState = { ...state };
      const { list, mapping } = nextState;
      const index = list.data.findIndex((id) => id === data.payload.conversationId);
      if (index > -1) {
        list.data.unshift(list.data.splice(index, 1)[0]);
        mapping[data.payload.conversationId].isPinned = true;
      }
      return {
        ...nextState
      };
    }
  },
  {
    on: updateTotalUnreadMessageInConversation,
    reducer(state: any, data: IReduxAction<IMessage>) {
      if (!state.mapping[data.payload.conversationId]) {
        return {
          ...state
        };
      }

      return {
        ...state,
        mapping: {
          ...state.mapping,
          [data.payload.conversationId]: {
            ...state.mapping[data.payload.conversationId],
            totalNotSeenMessages: state.mapping[data.payload.conversationId].totalNotSeenMessages + 1
          }
        }
      };
    }
  }
];

const messageReducer = [
  {
    on: fetchingMessage,
    reducer(state: any, data: IReduxAction<any>) {
      const { conversationMap } = state;
      const { conversationId } = data.payload;
      conversationMap[conversationId] = {
        ...conversationMap[conversationId],
        fetching: true
      };
      return { ...state };
    }
  },
  {
    on: loadMessagesSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const { conversationMap } = state;
      const { conversationId, items, total } = data.payload;
      conversationMap[conversationId] = {
        items: [...items.reverse()],
        total,
        fetching: false
      };
      return { ...state };
    }
  },
  {
    on: loadMoreMessagesSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const { conversationMap } = state;
      const { conversationId, items, total } = data.payload;
      conversationMap[conversationId] = {
        items: [
          ...items.reverse(),
          ...conversationMap[conversationId].items || []
        ],
        total,
        fetching: false
      };
      return { ...state };
    }
  },
  {
    on: sendMessage,
    reducer(state: any) {
      return {
        ...state,
        sendMessage: {
          sending: true
        }
      };
    }
  },
  {
    on: sendMessageSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const nextState = { ...state };
      if (!nextState.conversationMap[data.payload.conversationId] || !nextState.conversationMap[data.payload.conversationId].items) {
        nextState.conversationMap[data.payload.conversationId].items = [];
      }
      nextState.conversationMap[data.payload.conversationId].items.push(
        data.payload
      );
      return {
        ...nextState,
        sendMessage: {
          sending: false,
          success: true,
          data: data.payload
        }
      };
    }
  },
  {
    on: sendMessageFail,
    reducer(state: any, data: IReduxAction<any>) {
      return {
        ...state,
        sendMessage: {
          sending: false,
          success: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: receiveMessageSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const nextState = { ...state };
      if (!nextState.conversationMap[data.payload.conversationId]) {
        return { ...nextState };
      }
      nextState.conversationMap[data.payload.conversationId].items.push(
        data.payload
      );
      return {
        ...nextState,
        receiveMessage: data.payload
      };
    }
  },
  {
    on: sentFileSuccess,
    reducer(state: any, data: IReduxAction<any>) {
      const nextState = { ...state };
      if (!nextState.conversationMap[data.payload.conversationId] || !nextState.conversationMap[data.payload.conversationId].items) {
        nextState.conversationMap[data.payload.conversationId].items = [];
      }
      nextState.conversationMap[data.payload.conversationId].items.push(
        data.payload
      );
      return {
        ...nextState,
        sendMessage: {
          sending: false,
          success: true,
          data: data.payload
        }
      };
    }
  }
];

export default merge(
  {},
  createReducers(
    'conversation',
    [conversationReducer],
    initialConversationState
  ),
  createReducers('message', [messageReducer], initialMessageState)
);
