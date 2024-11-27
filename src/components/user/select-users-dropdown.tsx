import { userService } from '@services/user.service';
import { Avatar, message, Select } from 'antd';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';

type IProps = {
  style?: Record<string, string>;
  onSelect: Function;
  defaultValue?: string;
  disabled?: boolean;
  selectedIds?: string[];
}

export function SelectUserDropdown({
  onSelect,
  style = {},
  defaultValue = undefined,
  disabled = false,
  selectedIds = null
}: IProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const loadUsers = debounce(async (q) => {
    try {
      setLoading(true);
      const resp = await (await userService.search({ q, limit: 200 })).data;
      setData(resp.data);
      setLoading(false);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    loadUsers('');
  }, []);
  return (
    <Select
      showSearch
      defaultValue={defaultValue}
      placeholder="Type to search user"
      style={style}
      onSearch={loadUsers}
      onChange={onSelect.bind(this)}
      loading={loading}
      optionFilterProp="label"
      disabled={disabled}
    >
      {data && data.length > 0 && data.map((u) => (
        <Select.Option className={selectedIds && selectedIds.includes(u._id) ? 'selected-list' : ''} value={u._id} label={u?.name || u?.username} key={u._id} style={{ textTransform: 'capitalize' }}>
          <Avatar src={u?.avatar || '/no-avatar.png'} />
          {' '}
          {`${u?.name || u?.username || 'N/A'}`}
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectUserDropdown;
