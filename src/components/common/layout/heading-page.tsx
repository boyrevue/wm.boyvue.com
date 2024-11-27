/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import { ArrowLeftOutlined } from '@ant-design/icons';
import Router from 'next/router';
import React from 'react';

type IProps = {
  text: string;
  layout: any;
}

export function HeadingPage({
  text,
  layout
}: IProps) {
  return (
    <div className="flex-container">
      <div className="left-sidebar">
        <div className="sub-box">
          <a onClick={() => Router.back()} role="button">
            <ArrowLeftOutlined />
            &nbsp;
            <span>{text}</span>
          </a>
        </div>
      </div>
      <div className="right-sidebar">
        {layout}
      </div>
    </div>
  );
}

export default HeadingPage;
