import { categoryService } from '@services/index';
import { message, Select } from 'antd';
import { useEffect, useState } from 'react';

type IProps = {
  onSelect: Function;
  defaultValue?: string | string[];
  disabled?: boolean;
  isMultiple?:boolean;
  group?: string;
  noEmtpy?: boolean;
}

export function SelectCategoryDropdown({
  group = '',
  onSelect,
  defaultValue = '',
  disabled = false,
  isMultiple = false,
  noEmtpy = false
}: IProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const loadCategories = async (g: string) => {
    try {
      setLoading(true);
      const resp = await (await categoryService.search({
        group: g,
        limit: 500,
        status: 'active'
      })).data;
      setFirstLoadDone(true);
      setData(resp.data);
      setLoading(false);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error on load categories');
      setLoading(false);
      setFirstLoadDone(true);
    }
  };

  useEffect(() => {
    loadCategories(group);
  }, []);

  return firstLoadDone && (
  <Select
    mode={isMultiple ? 'multiple' : null}
    showSearch
    defaultValue={defaultValue}
    placeholder={`Select ${isMultiple ? 'categories' : 'category'} here`}
    style={{ width: '100%' }}
    onChange={(val) => onSelect(val)}
    loading={loading}
    optionFilterProp="children"
    disabled={disabled}
  >
    {!noEmtpy && (
    <Select.Option value="" key="all" style={{ textTransform: 'capitalize' }}>
      All categories
    </Select.Option>
    )}
    {data && data.length > 0 && data.map((u) => (
      <Select.Option value={u._id} key={u._id} style={{ textTransform: 'capitalize' }}>
        {`${u?.name || u?.slug || 'N/A'}`}
      </Select.Option>
    ))}
  </Select>
  );
}

export default SelectCategoryDropdown;
