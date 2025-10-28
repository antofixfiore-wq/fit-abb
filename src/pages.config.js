import Home from './pages/Home';
import Profile from './pages/Profile';
import Gyms from './pages/Gyms';
import GymDetail from './pages/GymDetail';
import Subscription from './pages/Subscription';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Profile": Profile,
    "Gyms": Gyms,
    "GymDetail": GymDetail,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};