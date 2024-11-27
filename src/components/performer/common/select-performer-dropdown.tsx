/* eslint-disable react/require-default-props */
import { performerService } from '@services/performer.service';
import { message, Select } from 'antd';
import { debounce } from 'lodash';
import { PureComponent } from 'react';

type IProps = {
  style?: Record<string, string>;
  onSelect: Function;
  defaultValue?: string;
  disabled?: boolean;
}

export class SelectPerformerDropdown extends PureComponent<IProps> {
  state = {
    loading: false,
    data: [] as any
  };

  loadPerformers = debounce(async (q) => {
    try {
      this.setState({ loading: true });
      const resp = await (await performerService.search({ q, limit: 200 })).data;
      this.setState({
        data: resp.data,
        loading: false
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      this.setState({ loading: false });
    }
  }, 500);

  componentDidMount() {
    this.loadPerformers('');
  }

  render() {
    const {
      style, onSelect, defaultValue, disabled
    } = this.props;
    const { data, loading } = this.state;
    return (
      <Select
        showSearch
        defaultValue={defaultValue}
        placeholder="Type to search model here"
        style={style}
        onSearch={this.loadPerformers.bind(this)}
        onChange={(val) => onSelect(val)}
        loading={loading}
        optionFilterProp="children"
        disabled={disabled}
      >
        <Select.Option value="" key="default">
          All
        </Select.Option>
        {data && data.length > 0 && data.map((u) => (
          <Select.Option value={u._id} key={u._id} style={{ textTransform: 'capitalize' }}>
            {`${u?.name || u?.username}`}
          </Select.Option>
        ))}
      </Select>
    );
  }
}
