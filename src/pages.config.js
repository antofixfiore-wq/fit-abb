/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import ClientDashboard from './pages/ClientDashboard';
import Community from './pages/Community';
import Contact from './pages/Contact';
import FitnessTracking from './pages/FitnessTracking';
import GymDashboard from './pages/GymDashboard';
import GymDetail from './pages/GymDetail';
import Gyms from './pages/Gyms';
import Home from './pages/Home';
import Landing from './pages/Landing';
import PTProfile from './pages/PTProfile';
import PartnersPage from './pages/PartnersPage';
import PersonalTrainers from './pages/PersonalTrainers';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import QRScanner from './pages/QRScanner';
import Subscription from './pages/Subscription';
import WorkoutPlanner from './pages/WorkoutPlanner';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "ClientDashboard": ClientDashboard,
    "Community": Community,
    "Contact": Contact,
    "FitnessTracking": FitnessTracking,
    "GymDashboard": GymDashboard,
    "GymDetail": GymDetail,
    "Gyms": Gyms,
    "Home": Home,
    "Landing": Landing,
    "PTProfile": PTProfile,
    "PartnersPage": PartnersPage,
    "PersonalTrainers": PersonalTrainers,
    "Pricing": Pricing,
    "Profile": Profile,
    "QRScanner": QRScanner,
    "Subscription": Subscription,
    "WorkoutPlanner": WorkoutPlanner,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};