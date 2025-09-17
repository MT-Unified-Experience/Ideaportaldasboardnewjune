import { DashboardData, Product, Quarter, ProductData, ActionItem } from '../types';

// Generate realistic dummy data for the dashboard
const generateDummyDashboardData = (product: Product, quarter: Quarter): DashboardData => {
  const quarterIndex = ['FY26 Q2', 'FY26 Q1', 'FY25 Q4', 'FY25 Q3'].indexOf(quarter);
  const baseValue = quarterIndex * 5 + 70; // Creates variation across quarters

  return {
    metricSummary: {
      responsiveness: Math.min(95, baseValue + Math.floor(Math.random() * 10)),
      responsivenessQuarterlyData: [
        { quarter: 'FY26 Q2', percentage: 95, totalIdeas: 41, ideasMovedOutOfReview: 39, ideasList: ['Email Integration', 'Advanced Analytics', 'Performance Optimization'] },
        { quarter: 'FY26 Q1', percentage: 85, totalIdeas: 38, ideasMovedOutOfReview: 32, ideasList: ['Search Improvements', 'Bulk Actions', 'Dashboard Customization'] },
        { quarter: 'FY25 Q4', percentage: 78, totalIdeas: 52, ideasMovedOutOfReview: 41, ideasList: ['API Enhancements', 'Custom Workflows', 'Document Management'] },
        { quarter: 'FY25 Q3', percentage: 82, totalIdeas: 45, ideasMovedOutOfReview: 37, ideasList: ['AI Integration', 'Mobile App', 'Reporting Tools'] }
      ],
      roadmapAlignment: {
        committed: 12 + quarterIndex * 2,
        total: 45 + quarterIndex * 5,
        commitmentStatus: quarterIndex < 2 ? 'On Track' : quarterIndex < 4 ? 'At Risk' : 'On Track',
        commitmentTrends: [
          { year: '2020', committed: 45, delivered: 42, ideas: [{ id: 'COMM-2020-001', summary: 'AI Integration Enhancement' }] },
          { year: '2021', committed: 52, delivered: 48, ideas: [{ id: 'COMM-2021-001', summary: 'Mobile App Development' }] },
          { year: '2022', committed: 48, delivered: 45, ideas: [{ id: 'COMM-2022-001', summary: 'Reporting Tools Upgrade' }] },
          { year: '2023', committed: 55, delivered: 52, ideas: [{ id: 'COMM-2023-001', summary: 'API Enhancement Project' }] },
          { year: '2024', committed: 60, delivered: 57, ideas: [{ id: 'COMM-2024-001', summary: 'Custom Workflow Builder' }] }
        ],
        quarterlyDeliveries: [
          { quarter: 'Q1', year: '2024', delivered: 14, ideas: [{ id: 'Q1-2024-001', summary: 'Real-time Notifications' }] },
          { quarter: 'Q2', year: '2024', delivered: 16, ideas: [{ id: 'Q2-2024-001', summary: 'Data Export Enhancements' }] },
          { quarter: 'Q3', year: '2024', delivered: 15, ideas: [{ id: 'Q3-2024-001', summary: 'User Permission Management' }] },
          { quarter: 'Q4', year: '2024', delivered: 17, ideas: [{ id: 'Q4-2024-001', summary: 'Automated Workflow Templates' }] }
        ]
      },
      continuedEngagement: {
        rate: 75 + quarterIndex * 3,
        numerator: 15 + quarterIndex * 2,
        denominator: 20 + quarterIndex * 2,
        quarterlyTrends: [
          { quarter: 'FY26 Q2', rate: 80, numerator: 24, denominator: 30 },
          { quarter: 'FY26 Q1', rate: 75, numerator: 21, denominator: 28 },
          { quarter: 'FY25 Q4', rate: 68, numerator: 17, denominator: 25 },
          { quarter: 'FY25 Q3', rate: 72, numerator: 18, denominator: 25 }
        ],
        ideas: [
          {
            id: 'ENG-001',
            name: 'AI Integration',
            initialStatusChange: '2025-01-15',
            subsequentChanges: [
              { date: '2025-02-01', status: 'Under Review' },
              { date: '2025-02-15', status: 'Committed' }
            ],
            daysBetween: 17,
            included: true
          },
          {
            id: 'ENG-002',
            name: 'Mobile App',
            initialStatusChange: '2025-02-01',
            subsequentChanges: [
              { date: '2025-02-20', status: 'In Development' }
            ],
            daysBetween: 19,
            included: true
          }
        ]
      },
      ideaVolume: {
        quarterly: 25 + quarterIndex * 5,
        total: 450 + quarterIndex * 50
      }
    },
    lineChartData: [
      { 
        quarter: 'FY26 Q2', 
        clientsRepresenting: 15,
        clients: ['Client A', 'Client B', 'Client C', 'Client D', 'Client E', 'Client F', 'Client G', 'Client H', 'Client I', 'Client J', 'Client K', 'Client L', 'Client M', 'Client N', 'Client O'],
        ideas: [
          { id: 'FY26Q2-001', clientName: 'Client A', summary: 'Collaboration Tools' },
          { id: 'FY26Q2-002', clientName: 'Client B', summary: 'Version Control System' },
          { id: 'FY26Q2-003', clientName: 'Client C', summary: 'Automated Backup Solutions' }
        ]
      },
      { 
        quarter: 'FY26 Q1', 
        clientsRepresenting: 12,
        clients: ['Client A', 'Client B', 'Client C', 'Client D', 'Client E', 'Client F', 'Client G', 'Client H', 'Client I', 'Client J', 'Client K', 'Client L'],
        ideas: [
          { id: 'FY26Q1-001', clientName: 'Client A', summary: 'Integration with Third-party Tools' },
          { id: 'FY26Q1-002', clientName: 'Client B', summary: 'Mobile Responsive Design' },
          { id: 'FY26Q1-003', clientName: 'Client C', summary: 'Advanced Search Filters' }
        ]
      },
      { 
        quarter: 'FY25 Q4', 
        clientsRepresenting: 10,
        clients: ['Client A', 'Client B', 'Client C', 'Client D', 'Client E', 'Client F', 'Client G', 'Client H', 'Client I', 'Client J'],
        ideas: [
          { id: 'FY25Q4-001', clientName: 'Client A', summary: 'Dashboard Customization' },
          { id: 'FY25Q4-002', clientName: 'Client B', summary: 'Email Integration' },
          { id: 'FY25Q4-003', clientName: 'Client C', summary: 'Advanced Analytics Dashboard' }
        ]
      },
      { 
        quarter: 'FY25 Q3', 
        clientsRepresenting: 8,
        clients: ['Client A', 'Client B', 'Client C', 'Client D', 'Client E', 'Client F', 'Client G', 'Client H'],
        ideas: [
          { id: 'FY25Q3-001', clientName: 'Client A', summary: 'AI-Powered Document Analysis' },
          { id: 'FY25Q3-002', clientName: 'Client B', summary: 'Mobile App Enhancement' },
          { id: 'FY25Q3-003', clientName: 'Client C', summary: 'Reporting Dashboard Improvements' }
        ]
      }
    ],
    topFeatures: [
      { feature_name: 'AI Integration', vote_count: 35, status: 'Committed', status_updated_at: '2025-01-15', client_voters: ['Client A', 'Client B', 'Client C'], estimated_impact: 'High', resource_requirement: 'High', strategic_alignment: 9, risks: ['Technical complexity', 'Resource allocation conflicts'] },
      { feature_name: 'Mobile App', vote_count: 25, status: 'Under Review', status_updated_at: '2025-02-01', client_voters: ['Client D', 'Client E'], estimated_impact: 'Medium', resource_requirement: 'Medium', strategic_alignment: 8, risks: ['Client expectation management', 'Technical complexity'] },
      { feature_name: 'Reporting Tools', vote_count: 20, status: 'Delivered', status_updated_at: '2025-01-30', client_voters: ['Client F', 'Client G'], estimated_impact: 'High', resource_requirement: 'Medium', strategic_alignment: 9, risks: ['Resource allocation conflicts'] },
      { feature_name: 'API Enhancements', vote_count: 18, status: 'Under Review', status_updated_at: '2025-02-15', client_voters: ['Client H', 'Client I'], estimated_impact: 'Medium', resource_requirement: 'High', strategic_alignment: 7, risks: ['Technical complexity', 'Client expectation management'] },
      { feature_name: 'Custom Workflows', vote_count: 16, status: 'Under Review', status_updated_at: '2025-02-16', client_voters: ['Client J', 'Client K'], estimated_impact: 'High', resource_requirement: 'High', strategic_alignment: 8, risks: ['Resource allocation conflicts', 'Technical complexity'] },
      { feature_name: 'Document Management', vote_count: 15, status: 'Committed', status_updated_at: '2025-02-17', client_voters: ['Client L', 'Client M'], estimated_impact: 'Medium', resource_requirement: 'Medium', strategic_alignment: 7, risks: ['Client expectation management'] },
      { feature_name: 'Search Improvements', vote_count: 14, status: 'Under Review', status_updated_at: '2025-02-18', client_voters: ['Client N', 'Client O'], estimated_impact: 'Medium', resource_requirement: 'Low', strategic_alignment: 6, risks: ['Technical complexity'] },
      { feature_name: 'Bulk Actions', vote_count: 13, status: 'Delivered', status_updated_at: '2025-02-19', client_voters: ['Client P', 'Client Q'], estimated_impact: 'Low', resource_requirement: 'Low', strategic_alignment: 6, risks: ['Resource allocation conflicts'] },
      { feature_name: 'Dashboard Customization', vote_count: 12, status: 'Under Review', status_updated_at: '2025-02-20', client_voters: ['Client R', 'Client S'], estimated_impact: 'Medium', resource_requirement: 'Medium', strategic_alignment: 7, risks: ['Client expectation management', 'Technical complexity'] },
      { feature_name: 'Email Integration', vote_count: 11, status: 'Committed', status_updated_at: '2025-02-21', client_voters: ['Client T', 'Client U'], estimated_impact: 'Low', resource_requirement: 'Low', strategic_alignment: 5, risks: ['Technical complexity'] }
    ],
    collaborationTrendData: [
      {
        quarter: 'FY26 Q2',
        year: 2025,
        collaborativeIdeas: 15,
        totalIdeas: 40,
        collaborationRate: 38,
        topCollaborativeIdeas: [
          {
            id: 'COLLAB-Q2-001',
            name: 'Advanced Analytics Platform',
            originalSubmitter: 'Client A',
            contributors: ['Client A', 'Client B', 'Client C'],
            submissionDate: '2025-07-01',
            collaborationScore: 93,
            status: 'Active',
            comments: 'Comprehensive analytics platform requested by multiple enterprise clients.'
          }
        ]
      },
      {
        quarter: 'FY26 Q1',
        year: 2025,
        collaborativeIdeas: 12,
        totalIdeas: 35,
        collaborationRate: 34,
        topCollaborativeIdeas: [
          {
            id: 'COLLAB-Q1-001',
            name: 'Advanced Search Capabilities',
            originalSubmitter: 'Client E',
            contributors: ['Client E', 'Client F', 'Client G'],
            submissionDate: '2025-04-01',
            collaborationScore: 90,
            status: 'Delivered',
            comments: 'Advanced search requested by clients dealing with large document repositories.'
          }
        ]
      },
      {
        quarter: 'FY25 Q4',
        year: 2025,
        collaborativeIdeas: 8,
        totalIdeas: 30,
        collaborationRate: 27,
        topCollaborativeIdeas: [
          {
            id: 'COLLAB-Q4-001',
            name: 'Collaborative Review Dashboard',
            originalSubmitter: 'Client A',
            contributors: ['Client A', 'Client B', 'Client D'],
            submissionDate: '2025-01-01',
            collaborationScore: 88,
            status: 'Delivered',
            comments: 'Collaborative review features requested to improve multi-stakeholder decision making.'
          }
        ]
      },
      {
        quarter: 'FY25 Q3',
        year: 2025,
        collaborativeIdeas: 5,
        totalIdeas: 25,
        collaborationRate: 20,
        topCollaborativeIdeas: [
          {
            id: 'COLLAB-Q3-001',
            name: 'AI-Powered Document Analysis',
            originalSubmitter: 'Client A',
            contributors: ['Client A', 'Client B', 'Client C'],
            submissionDate: '2024-10-01',
            collaborationScore: 85,
            status: 'Active',
            comments: 'Multiple clients have requested enhanced AI capabilities for document processing and analysis.'
          }
        ]
      }
    ],
    data_socialization_forums: [
      { name: 'CSC' },
      { name: 'Sprint Reviews' },
      { name: 'Customer Advisory Board (CAB)' },
      { name: 'CWG' }
    ]
  };
};

// Create dummy data for all products and quarters
export const createDummyProductData = (): Record<Product, ProductData> => {
  const products: Product[] = [
    'TeamConnect',
    'Collaborati',
    'LegalHold',
    'TAP Workflow Automation',
    'HotDocs',
    'eCounsel',
    'CaseCloud',
  ];
  
  const quarters: Quarter[] = ['FY26 Q2', 'FY26 Q1', 'FY25 Q4', 'FY25 Q3'];
  
  const dummyData: Record<Product, ProductData> = {} as Record<Product, ProductData>;
  
  products.forEach(product => {
    dummyData[product] = {};
    quarters.forEach(quarter => {
      dummyData[product][quarter] = generateDummyDashboardData(product, quarter);
    });
  });
  
  return dummyData;
};

// Generate dummy action items
export const generateDummyActionItems = (product: Product, quarter: Quarter): ActionItem[] => {
  const actionItems: ActionItem[] = [
    {
      id: '1',
      product,
      quarter,
      text: 'Review client feedback for AI Integration feature',
      completed: false,
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T10:00:00Z'
    },
    {
      id: '2',
      product,
      quarter,
      text: 'Schedule stakeholder meeting for Mobile App requirements',
      completed: true,
      created_at: '2025-01-10T14:30:00Z',
      updated_at: '2025-01-16T09:15:00Z'
    },
    {
      id: '3',
      product,
      quarter,
      text: 'Update roadmap with Q4 deliverables',
      completed: false,
      created_at: '2025-01-20T16:45:00Z',
      updated_at: '2025-01-20T16:45:00Z'
    }
  ];

  // Add some general action items for the General tab
  if (product === 'General') {
    actionItems.push(
      {
        id: '4',
        product: 'General',
        quarter,
        text: 'Prepare quarterly business review presentation',
        completed: false,
        created_at: '2025-01-12T11:20:00Z',
        updated_at: '2025-01-12T11:20:00Z'
      },
      {
        id: '5',
        product: 'General',
        quarter,
        text: 'Conduct cross-product collaboration analysis',
        completed: true,
        created_at: '2025-01-08T13:15:00Z',
        updated_at: '2025-01-18T10:30:00Z'
      }
    );
  }

  return actionItems;
};