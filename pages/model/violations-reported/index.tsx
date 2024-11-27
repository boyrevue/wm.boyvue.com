import { ArrowLeftOutlined } from '@ant-design/icons';
import PageTitle from '@components/common/page-title';
import ReportTableList from '@components/report/report-table-list';
import {
  Layout, message, PageHeader
} from 'antd';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import { reportService } from 'src/services';

function PerformerReportList() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    data: [],
    total: 0
  });
  const limit = 12;

  const getBlockList = async (page = 1) => {
    try {
      const offset = (page - 1) * limit;
      setLoading(true);
      const resp = await reportService.search({
        limit,
        offset: offset * limit
      });
      setResults(resp.data);
      setLoading(false);
    } catch (e) {
      message.error('An error occured, please try again later');
      setLoading(false);
    }
  };

  useEffect(() => {
    getBlockList();
  }, []);

  return (
    <Layout>
      <PageTitle title="Violations Reported" />
      <div className="main-container">
        <PageHeader
          onBack={() => Router.back()}
          backIcon={<ArrowLeftOutlined />}
          title="Violations Reported"
        />
        <ReportTableList
          items={results.data}
          searching={loading}
          total={results.total}
          onChange={getBlockList}
          pageSize={limit}
        />
      </div>
    </Layout>
  );
}

PerformerReportList.authenticate = true;
PerformerReportList.onlyPerformer = true;

export default PerformerReportList;
