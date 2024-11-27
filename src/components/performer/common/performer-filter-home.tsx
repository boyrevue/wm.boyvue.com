import {
  Input, Select
} from 'antd';
import { omit } from 'lodash';
import { PureComponent } from 'react';

type IProps = {
  onSubmit: Function;
  categories: any;
  categoryId: string;
}

export class PerformerFilterHome extends PureComponent<IProps> {
  state = {
    q: '',
    showMore: false,
    type: ''
  };

  handleSubmit() {
    const { onSubmit } = this.props;
    onSubmit(omit(this.state));
  }

  render() {
    const {
      categories, categoryId
    } = this.props;

    return (
      <div className="filter-block">
        {categories && categories.length > 0 && (
          <div className="filter-item">
            <Select style={{ width: '100%' }} defaultValue={categoryId} onChange={(val) => this.setState({ categoryIds: val }, () => this.handleSubmit())}>
              <Select.Option value="">
                All Category
              </Select.Option>
              {categories.map((c) => (
                <Select.Option value={c._id} key={c._id}>
                  <span style={{ textTransform: 'capitalize' }}>{c.name}</span>
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        <div className="filter-item">
          <Select
            onChange={(val) => this.setState({ type: val }, () => this.handleSubmit())}
            style={{ width: '100%' }}
            defaultValue=""
          >
            <Select.Option key="">
              All Content Creators
            </Select.Option>
            <Select.Option key="subscribed">
              Subscribed Content Creators
            </Select.Option>
            <Select.Option key="live">
              Live Content Creators
            </Select.Option>
          </Select>
        </div>
        <div className="filter-item custom">
          <Input.Search
            style={{ width: '100%' }}
            placeholder="Enter keyword"
            onChange={(evt) => this.setState({ q: evt.target.value })}
            // onPressEnter={this.handleSubmit.bind(this)}
            enterButton
            onSearch={this.handleSubmit.bind(this)}
          />
        </div>
      </div>
    );
  }
}
