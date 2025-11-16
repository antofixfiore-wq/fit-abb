import Home from './pages/Home';
import Profile from './pages/Profile';
import Gyms from './pages/Gyms';
import GymDetail from './pages/GymDetail';
import Subscription from './pages/Subscription';
import GymDashboard from './pages/GymDashboard';
import ClientDashboard from './pages/ClientDashboard';
import WorkoutPlanner from './pages/WorkoutPlanner';
import Community from './pages/Community';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Profile": Profile,
    "Gyms": Gyms,
    "GymDetail": GymDetail,
    "Subscription": Subscription,
    "GymDashboard": GymDashboard,
    "ClientDashboard": ClientDashboard,
    "WorkoutPlanner": WorkoutPlanner,
    "Community": Community,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};