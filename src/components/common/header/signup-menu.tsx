import {
  Button
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

import style from './signup-menu.module.less';

export function SignupMenu() {
  const router = useRouter();
  return (
    <ul className={`${style['nav-icons']} custom`}>
      <li
        key="login"
        className={
          router.pathname === '/auth/login' ? 'active' : ''
        }
      >
        <Link href="/auth/login">
          <Button>
            Log in
          </Button>
        </Link>
      </li>
      <li
        key="signup"
        className={
          router.pathname === '/auth/register' ? 'active' : ''
        }
      >
        <Link href="/auth/register">
          <Button
            type="primary"
          >
            Sign Up
          </Button>
        </Link>
      </li>
    </ul>
  );
}

export default SignupMenu;
