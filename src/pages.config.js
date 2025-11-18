import Home from './pages/Home';
import Profile from './pages/Profile';
import Gyms from './pages/Gyms';
import GymDetail from './pages/GymDetail';
import Subscription from './pages/Subscription';
import GymDashboard from './pages/GymDashboard';
import ClientDashboard from './pages/ClientDashboard';
import WorkoutPlanner from './pages/WorkoutPlanner';
import Community from './pages/Community';
import Landing from './pages/Landing';
import About from './pages/About';
import PartnersPage from './pages/PartnersPage';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import __Layout from './Layout.jsx';


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
    "Landing": Landing,
    "About": About,
    "PartnersPage": PartnersPage,
    "Pricing": Pricing,
    "Contact": Contact,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};