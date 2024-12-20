import {
  Button, Col, Input, Row, Select
} from 'antd';
import { PureComponent } from 'react';

type IProps = {
  onSubmit?: Function;
  statuses?: {
    key: string;
    text?: string;
  }[];
  genders?: {
    key?: string;
    text?: string;
  }[];
}

export class SearchFilter extends PureComponent<IProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    onSubmit() {},
    statuses: [],
    genders: []
  };

  state = {
    q: ''
  };

  render() {
    const { statuses = [], genders = [], onSubmit } = this.props;
    return (
      <Row gutter={24} className="filter-block">
        <Col xl={{ span: 6 }} md={{ span: 8 }} xs={{ span: 8 }}>
          <Input.Search
            placeholder="Enter keyword"
            onChange={(evt) => this.setState({ q: evt.target.value })}
            // onPressEnter={() => onSubmit(this.state)}
            enterButton
            onSearch={() => onSubmit(this.state)}
          />
        </Col>
        {statuses.length ? (
          <Col xl={{ span: 6 }} md={{ span: 8 }} xs={{ span: 8 }}>
            <Select
              onChange={(val) => this.setState({ status: val })}
              style={{ width: '100%' }}
              placeholder="Select status"
              defaultValue=""
            >
              {statuses.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {genders.length ? (
          <Col xl={{ span: 6 }} md={{ span: 8 }} xs={{ span: 8 }}>
            <Select
              onChange={(val) => this.setState({ gender: val })}
              style={{ width: '100%' }}
              placeholder="Select gender"
              defaultValue=""
            >
              {genders.map((gen) => (
                <Select.Option key={gen.key} value={gen.key}>
                  {gen.text || gen.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        <Col xl={{ span: 2 }} md={{ span: 6 }} xs={{ span: 8 }}>
          <Button
            type="primary"
            className="primary"
            onClick={() => onSubmit(this.state)}
          >
            Search
          </Button>
        </Col>
      </Row>
    );
  }
}
