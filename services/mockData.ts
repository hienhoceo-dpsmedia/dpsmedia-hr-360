import { StaffInfo, TotalTaskDone, LifeLongLearning, TeamsChatActivity, PresenceLog, Kudos } from '../types';

// HR_STAFF_INFO - Real Vietnamese Names
export const MOCK_STAFF: StaffInfo[] = [
  { id: '1', name: 'Trương Thị Quỳnh Trang', lark_email: 'trang.truong@dps.media', ms_id: 'DPS001', department: 'Product', active: true, role: 'admin' },
  { id: '2', name: 'Hồ Quang Hiển', lark_email: 'hien.ho@dps.media', ms_id: 'DPS002', department: 'Engineering', active: true, role: 'staff' },
  { id: '3', name: 'Bùi Thị Hà Trang', lark_email: 'trang.bui@dps.media', ms_id: 'DPS003', department: 'Marketing', active: true, role: 'staff' },
  { id: '4', name: 'Nguyễn Văn Bảo', lark_email: 'bao.nguyen@dps.media', ms_id: 'DPS004', department: 'Engineering', active: true, role: 'staff' },
  { id: '5', name: 'Phạm Minh Tuấn', lark_email: 'tuan.pham@dps.media', ms_id: 'DPS005', department: 'Sales', active: true, role: 'staff' },
  { id: '6', name: 'Lê Thị Thu Thảo', lark_email: 'thao.le@dps.media', ms_id: 'DPS006', department: 'HR', active: true, role: 'admin' },
];

// HR_TOTAL_TASK_DONE
export const MOCK_TASKS: TotalTaskDone[] = [
  { email: 'trang.truong@dps.media', task_name: 'Q3 Product Roadmap', completed_date: '2025-02-15', is_done: true },
  { email: 'trang.truong@dps.media', task_name: 'Feature Spec: HR360', completed_date: '2025-02-20', is_done: true },
  { email: 'trang.truong@dps.media', task_name: 'Client Meeting Notes', completed_date: '2025-02-22', is_done: true },
  { email: 'hien.ho@dps.media', task_name: 'Database Migration', completed_date: '2025-02-10', is_done: true },
  { email: 'hien.ho@dps.media', task_name: 'API Optimization', completed_date: '2025-02-12', is_done: true },
  { email: 'hien.ho@dps.media', task_name: 'Unit Tests', completed_date: '2025-02-14', is_done: true },
  { email: 'bao.nguyen@dps.media', task_name: 'Frontend Setup', completed_date: '2025-02-15', is_done: true },
];

// HR_LIFELONGLEARNING
export const MOCK_LEARNING: LifeLongLearning[] = [
  { email: 'trang.truong@dps.media', learning_points: 50, training_points: 20, creative_points: 15, date: '2025-02-01' },
  { email: 'hien.ho@dps.media', learning_points: 80, training_points: 10, creative_points: 40, date: '2025-02-15' },
  { email: 'trang.bui@dps.media', learning_points: 30, training_points: 50, creative_points: 20, date: '2025-02-10' },
];

// HR_TEAMS_CHATS
export const MOCK_CHATS: TeamsChatActivity[] = [
  { email: 'trang.truong@dps.media', chat_count: 450, meeting_count: 15, hello_hub_posts: 5, lab_ideas: 3, reply_messages: 200, date: '2025-02-10' },
  { email: 'hien.ho@dps.media', chat_count: 120, meeting_count: 5, hello_hub_posts: 1, lab_ideas: 10, reply_messages: 80, date: '2025-02-11' },
  { email: 'trang.bui@dps.media', chat_count: 600, meeting_count: 8, hello_hub_posts: 10, lab_ideas: 2, reply_messages: 350, date: '2025-02-12' },
];

// HR_PRESENCE_LOG (Using Names to test identity resolution)
export const MOCK_PRESENCE: PresenceLog[] = [
  { name: 'Trương Thị Quỳnh Trang', available_minutes: 2500, date: '2025-02-01' }, 
  { name: 'Hồ Quang Hiển', available_minutes: 2200, date: '2025-02-01' }, 
  { name: 'Bùi Thị Hà Trang', available_minutes: 2600, date: '2025-02-01' },
  { name: 'Nguyễn Văn Bảo', available_minutes: 2400, date: '2025-02-01' },
];

// PEER RECOGNITION
export const MOCK_KUDOS: Kudos[] = [
  { id: '1', fromName: 'Bùi Thị Hà Trang', fromAvatar: 'https://ui-avatars.com/api/?name=Bùi+Thị+Hà+Trang&background=random', toEmail: 'trang.truong@dps.media', message: 'Thanks for helping me with the slide deck! You rock 🤘', date: '2025-02-20', category: 'Helpful' },
  { id: '2', fromName: 'Hồ Quang Hiển', fromAvatar: 'https://ui-avatars.com/api/?name=Hồ+Quang+Hiển&background=random', toEmail: 'trang.truong@dps.media', message: 'Great idea on the database schema.', date: '2025-02-18', category: 'Creative' },
  { id: '3', fromName: 'Phạm Minh Tuấn', fromAvatar: 'https://ui-avatars.com/api/?name=Phạm+Minh+Tuấn&background=random', toEmail: 'hien.ho@dps.media', message: 'Fastest API response times ever. Good job!', date: '2025-02-22', category: 'Teamwork' },
];
