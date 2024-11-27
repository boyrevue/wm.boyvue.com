import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';

type IProps = {
  onMenuClick: any;
  menuOptions?: any[];
  buttonStyle?: any;
  dropdownProps?: any;
}

export function DropOption({
  onMenuClick,
  menuOptions = [],
  buttonStyle = {},
  dropdownProps = null
}: IProps) {
  const menuItems = menuOptions.map((item) => ({
    key: item.key,
    label: item.name
  }));

  return (
    <Dropdown
      overlay={<Menu onClick={onMenuClick} items={menuItems} />}
      {...dropdownProps}
    >
      <Button style={{ border: 'none', ...buttonStyle }}>
        Sort
        <DownOutlined />
      </Button>
    </Dropdown>
  );
}

export default DropOption;
