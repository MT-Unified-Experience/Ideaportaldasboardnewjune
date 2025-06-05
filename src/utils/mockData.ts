import { DashboardData, ProductData, Product } from '../types';

// Generate mock data for each product and quarter
const generateMockData = (): DashboardData => {
  return {
    metricSummary: {
      responsiveness: Math.floor(Math.random() * 30) + 70, // 70-100%
      roadmapAlignment: {
        committed: Math.floor(Math.random() * 15) + 5, // 5-20 ideas
        total: Math.floor(Math.random() * 20) + 30, // 30-50 ideas
      },
      clientRepresentation: Math.floor(Math.random() * 20) + 5, // 5-25
      crossClientCollaboration: Math.floor(Math.random() * 50) + 30, // 30-80%
      ideaVolume: {
        quarterly: Math.floor(Math.random() * 30) + 20, // 20-50 ideas
        total: Math.floor(Math.random() * 500) + 300, // 300-800 ideas
      },
    },
    stackedBarData: [
      { year: 'FY22', newIdeas: Math.floor(Math.random() * 30) + 10, flaggedForFuture: Math.floor(Math.random() * 20) + 5 },
      { year: 'FY23', newIdeas: Math.floor(Math.random() * 40) + 15, flaggedForFuture: Math.floor(Math.random() * 25) + 10 },
      { year: 'FY24', newIdeas: Math.floor(Math.random() * 50) + 20, flaggedForFuture: Math.floor(Math.random() * 30) + 15 },
      { year: 'FY25', newIdeas: Math.floor(Math.random() * 60) + 25, flaggedForFuture: Math.floor(Math.random() * 35) + 20 },
    ],
    lineChartData: [
      { quarter: 'FY25 Q1', newIdeas: Math.floor(Math.random() * 20) + 10, clientsRepresenting: Math.floor(Math.random() * 10) + 5 },
      { quarter: 'FY25 Q2', newIdeas: Math.floor(Math.random() * 25) + 12, clientsRepresenting: Math.floor(Math.random() * 12) + 6 },
      { quarter: 'FY25 Q3', newIdeas: Math.floor(Math.random() * 30) + 15, clientsRepresenting: Math.floor(Math.random() * 15) + 7 },
      { quarter: 'FY25 Q4', newIdeas: Math.floor(Math.random() * 35) + 17, clientsRepresenting: Math.floor(Math.random() * 17) + 8 },
    ],
    pieChartData: [
      { name: 'AI Integration', value: Math.floor(Math.random() * 40) + 30, status: 'Committed', quarter: 'FY25 Q2' },
      { name: 'Mobile App', value: Math.floor(Math.random() * 30) + 20, status: 'Under Review' },
      { name: 'Reporting Tools', value: Math.floor(Math.random() * 25) + 15, status: 'Delivered' },
    ],
    commitmentData: {
      pastIdeasInPlan: Math.floor(Math.random() * 15) + 10,
      newIdeasInPlan: Math.floor(Math.random() * 20) + 15,
      avgTimeToCommitment: Math.floor(Math.random() * 30) + 20,
    },
    topClients: [
      { id: 1, name: 'Client A', ideasSubmitted: Math.floor(Math.random() * 10) + 15, avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 2, name: 'Client B', ideasSubmitted: Math.floor(Math.random() * 8) + 10, avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: 3, name: 'Client C', ideasSubmitted: Math.floor(Math.random() * 6) + 5, avatar: 'https://i.pravatar.cc/150?img=3' },
    ],
  };
};

// Create mock data for all products and quarters
export const createMockProductData = (): Record<Product, ProductData> => {
  const products: Product[] = [
    'TeamConnect',
    'Collaborati',
    'LegalHold',
    'TAP Workflow Automation',
    'HotDocs',
    'eCounsel',
    'CaseCloud',
  ];
  
  const quarters = ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'];
  
  const mockData: Record<Product, ProductData> = {} as Record<Product, ProductData>;
  
  products.forEach(product => {
    mockData[product] = {};
    quarters.forEach(quarter => {
      mockData[product][quarter] = generateMockData();
    });
  });
  
  return mockData;
};