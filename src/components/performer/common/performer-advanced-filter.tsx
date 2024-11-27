import { FilterOutlined } from '@ant-design/icons';
import { IBody, ICountry } from '@interfaces/index';
import {
  Button, Col, Input, Modal,
  Row,
  Select
} from 'antd';
import { omit } from 'lodash';
import { PureComponent } from 'react';
import { SortIcon } from 'src/icons';

import style from './performer-filter.module.less';

type IProps = {
  onSubmit: Function;
  countries: ICountry[];
  bodyInfo: IBody;
  categories: any;
  categoryId: string;
}

export class PerformerAdvancedFilter extends PureComponent<IProps> {
  state = {
    q: '',
    type: '',
    showModal: false,
    loading: false
  };

  handleSubmit() {
    try {
      const { onSubmit } = this.props;
      this.setState({ loading: true });
      onSubmit(omit(this.state, ['showMore']));
    } catch (error) {
      //
    } finally {
      setTimeout(() => {
        this.setState({ loading: false, showModal: false });
      }, 1000);
    }
  }

  render() {
    const {
      countries, bodyInfo, categories, categoryId
    } = this.props;
    const { showModal, loading } = this.state;
    const {
      heights = [], weights = [], bodyTypes = [], genders = [], sexualOrientations = [], ethnicities = [],
      ages = [], hairs = [], pubicHairs = [], eyes = [], butts = []
    } = bodyInfo;
    return (
      <>
        <div className={style['filter-block']}>
          <div className="left-filter">
            <Input.Search
              style={{ width: '100%' }}
              placeholder="Enter keyword"
              onChange={(evt) => this.setState({ q: evt.target.value })}
                // onPressEnter={this.handleSubmit.bind(this)}
              enterButton
              onSearch={this.handleSubmit.bind(this)}
            />

          </div>
          <div className="right-filter">
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
            <div className="filter-item last">
              <Select style={{ minWidth: '120px' }} defaultValue="" onChange={(val) => this.setState({ sortBy: val }, () => this.handleSubmit())}>
                <Select.Option value="" disabled>
                  <SortIcon style={{ verticalAlign: 'middle' }} />
                  {' '}
                  <span>Sort By</span>
                </Select.Option>
                <Select.Option value="popular">
                  Popular
                </Select.Option>
                <Select.Option label="" value="latest">
                  Latest
                </Select.Option>
                <Select.Option value="oldest">
                  Oldest
                </Select.Option>
              </Select>
            </div>
            <div className="filter-item">
              <Button
                type="primary"
                className="primary"
                style={{ width: '100%' }}
                onClick={() => this.setState({ showModal: true })}
              >
                <FilterOutlined />
                {' '}
                Advanced search
              </Button>
            </div>
          </div>
        </div>
        <Modal
          key="Advanced_search"
          className={style['modal-advanced-search']}
          centered
          width={550}
          visible={showModal}
          title="Advanced search"
          onCancel={() => this.setState({ showModal: false })}
          footer={[
            <Button
              key="close"
              className="secondary"
              onClick={() => this.setState({ showModal: false })}
            >
              Close
            </Button>,
            <Button
              style={{ marginLeft: 0 }}
              key="close-show"
              className="primary"
              onClick={this.handleSubmit.bind(this)}
              loading={loading}
            >
              Apply
            </Button>
          ]}
        >
          <Row>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Content Creators</span>
                <Select
                  onChange={(val) => this.setState({ type: val })}
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
            </Col>
            <Col xs={24} sm={12} md={12}>
              {countries && countries.length > 0 && (
                <div className="filter-item">
                  <span className="title-filter">Countries</span>
                  <Select
                    onChange={(val) => this.setState({ country: val })}
                    style={{ width: '100%' }}
                    placeholder="Countries"
                    defaultValue=""
                    showSearch
                    optionFilterProp="label"
                  >
                    <Select.Option key="All" label="" value="">
                      All countries
                    </Select.Option>
                    {countries.map((c) => (
                      <Select.Option key={c.code} label={c.name} value={c.code}>
                        <img alt="flag" src={c.flag} width="25px" />
                    &nbsp;
                        {c.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
            </Col>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Gender</span>
                <Select
                  onChange={(val) => this.setState({ gender: val })}
                  style={{ width: '100%' }}
                  placeholder="Gender"
                  defaultValue=""
                >
                  {' '}
                  <Select.Option key="all" value="">
                    All gender
                  </Select.Option>
                  {genders.map((gen) => (
                    <Select.Option key={gen.value} value={gen.value}>
                      {gen.text || gen.value}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Sexual orientation</span>
                <Select
                  onChange={(val) => this.setState({ sexualPreference: val })}
                  style={{ width: '100%' }}
                  defaultValue=""
                >
                  <Select.Option key="all" value="">
                    All sexual orientation
                  </Select.Option>
                  {sexualOrientations.map((gen) => (
                    <Select.Option key={gen.value} value={gen.value}>
                      {gen.text || gen.value}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Age</span>
                <Select
                  onChange={(val) => this.setState({ age: val })}
                  style={{ width: '100%' }}
                  placeholder="Age"
                  defaultValue=""
                >
                  <Select.Option key="all" value="">
                    All age
                  </Select.Option>
                  {ages.map((i) => (
                    <Select.Option key={i.value} value={i.value}>
                      {i.text || i.value}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Eye color</span>
                <Select
                  onChange={(val) => this.setState({ eyes: val })}
                  style={{ width: '100%' }}
                  placeholder="Eye color"
                  defaultValue=""
                >
                  <Select.Option key="all" value="">
                    All eye color
                  </Select.Option>
                  {eyes.map((i) => (
                    <Select.Option key={i.value} value={i.value}>
                      {i.text || i.value}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Hair color</span>
                <Select
                  onChange={(val) => this.setState({ hair: val })}
                  style={{ width: '100%' }}
                  placeholder="Hair color"
                  defaultValue=""
                >
                  <Select.Option key="all" value="">
                    All hair
                  </Select.Option>
                  {hairs.map((i) => (
                    <Select.Option key={i.value} value={i.value}>
                      {i.text || i.value}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Pubic hair</span>
                <Select
                  onChange={(val) => this.setState({ pubicHair: val })}
                  style={{ width: '100%' }}
                  placeholder="Pubic hair"
                  defaultValue=""
                >
                  <Select.Option key="all" value="">
                    All pubic hair
                  </Select.Option>
                  {pubicHairs.map((i) => (
                    <Select.Option key={i.value} value={i.value}>
                      {i.text || i.value}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Butt size</span>
                <Select
                  onChange={(val) => this.setState({ butt: val })}
                  style={{ width: '100%' }}
                  placeholder="Butt size"
                  defaultValue=""
                >
                  <Select.Option key="all" value="">
                    All butt size
                  </Select.Option>
                  {butts.map((i) => (
                    <Select.Option key={i.value} value={i.value}>
                      {i.text || i.value}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12}>
              {heights.length > 0 && (
                <div className="filter-item">
                  <span className="title-filter">Height</span>
                  <Select
                    onChange={(val) => this.setState({ height: val })}
                    style={{ width: '100%' }}
                    placeholder="Height"
                    defaultValue=""
                  >
                    <Select.Option key="all" value="">
                      All height
                    </Select.Option>
                    {heights.map((i) => (
                      <Select.Option key={i.text} value={i.text}>
                        {i.text}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
            </Col>
            <Col xs={24} sm={12} md={12}>
              {weights.length > 0 && (
                <div className="filter-item">
                  <span className="title-filter">Weight</span>
                  <Select
                    onChange={(val) => this.setState({ weight: val })}
                    style={{ width: '100%' }}
                    placeholder="Weight"
                    defaultValue=""
                  >
                    <Select.Option key="all" value="">
                      All weight
                    </Select.Option>
                    {weights.map((i) => (
                      <Select.Option key={i.text} value={i.text}>
                        {i.text}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
            </Col>
            <Col xs={24} sm={12} md={12}>
              <div className="filter-item">
                <span className="title-filter">Ethnicity</span>
                <Select
                  onChange={(val) => this.setState({ ethnicity: val })}
                  style={{ width: '100%' }}
                  placeholder="Select ethnicity"
                  defaultValue=""
                >
                  <Select.Option key="all" value="">
                    All ethnicity
                  </Select.Option>
                  {ethnicities.map((i) => (
                    <Select.Option key={i.value} value={i.value}>
                      {i.text || i.value}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={12}>
              {bodyTypes.length > 0 && (
                <div className="filter-item">
                  <span className="title-filter">Body type</span>
                  <Select
                    onChange={(val) => this.setState({ bodyType: val })}
                    style={{ width: '100%' }}
                    placeholder="Select body type"
                    defaultValue=""
                  >
                    <Select.Option key="all" value="">
                      All body
                    </Select.Option>
                    {bodyTypes.map((i) => (
                      <Select.Option key={i.value} value={i.value}>
                        {i.text || i.value}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
            </Col>
          </Row>
        </Modal>
      </>
    );
  }
}
