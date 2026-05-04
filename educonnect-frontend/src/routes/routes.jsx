import { Route, BrowserRouter, Navigate, Routes, Outlet } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';
import MainLayout from '../layouts/MainLayout';
import SignupPage from '../features/auth/pages/SignupPage';
import LoginPage from '../features/auth/pages/LoginPage';
import HomePage from '../features/home/pages/HomePage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import UserRoute from './UserRoute';
import StudentsPage from '../features/students/pages/StudentPage';
import ConnectionsPage from '../features/students/pages/ConnectionsPage';
import MessagePage from '../features/chat/pages/MessagePage';
import PersonalChatPage from '../features/chat/pages/PersonalChatPage';
import GroupChatPage from '../features/chat/pages/GroupChatPage';
import GroupList from '../features/chat/pages/GroupListPage';
import QuestionPage from '../features/qconnect/pages/QuestionPage';
import QConnectPage from '../features/qconnect/pages/QConnectPage';
import PostQuestion from '../features/qconnect/pages/PostQuestion';
import MyQuestionPage from '../features/qconnect/pages/MyQuestions';
import EnhancedEventsPage from '../features/events/pages/EnhancedEventsPage';
import EventDetailPage from '../features/events/pages/EventDetailPage';
import EditEventPage from '../features/events/pages/EditEventPage';
import UserRegistrationsPage from '../features/events/pages/UserRegistrationsPage';
import EventRegistrationsPage from '../features/events/pages/EventRegistrationsPage';

const AppRouter = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Navigate to="/notfound" replace />} />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />


          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          <Route path="/" element={<UserRoute />} >
            <Route path="/students" element={<Outlet/>}>
              <Route index element={<StudentsPage />} />
              <Route path='/students/connections' element={<ConnectionsPage />} />
            </Route>
            <Route path = "/chat" element={<Outlet />}>
              <Route index element={<MessagePage />} />
              <Route path = "/chat/personal" element={<PersonalChatPage />} />
              <Route path = "/chat/group" element = {<GroupChatPage />} />
              <Route path = "/chat/groups" element = {<GroupList />} />
            </Route>
            <Route path="/qconnect" element={<Outlet />}>
              <Route index element={<QConnectPage  />} />
              <Route path="/qconnect/question/:id" element={<QuestionPage />} />
              <Route path="/qconnect/post" element={<PostQuestion />} />
              <Route path="/qconnect/myquestion" element={<MyQuestionPage />} /> 
            </Route>
            <Route path="/events" element={<Outlet />}>
              <Route index element={<EnhancedEventsPage />} />
              <Route path="/events/:eventId" element={<EventDetailPage />} />
              <Route path="/events/:eventId/edit" element={<EditEventPage />} />
              <Route path="/events/my-registrations" element={<UserRegistrationsPage />} />
              <Route path="/events/:eventId/registrations" element={<EventRegistrationsPage />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>



        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRouter;
