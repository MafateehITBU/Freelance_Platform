import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import SignInPage from "./pages/SignInPage";
import HomePageTen from "./pages/HomePageTen";
import FreelancersPage from "./pages/FreelancersPage";
import InfluencersPage from "./pages/InfluencersPage";
import UsersPage from "./pages/UsersPage";
import CategoriesPage from "./pages/CategoriesPage";
import ServicesPage from "./pages/ServicesPage";
import SubscriptionPage from "./pages/SubscriptionPage";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/" element={<HomePageTen />}/>
        <Route path="/freelancers" element={<FreelancersPage />}/>
        <Route path="/influencers" element={<InfluencersPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        {/* <Route path="/services" element={<ServicesPage />} /> */}
        <Route path="/subscription-plans" element={<SubscriptionPage />} />

        
        {/* Catch all route - redirect to signin if not authenticated */}
        <Route
          path="*"
          element={
            ({ user }) => (
              user ? (
                <Navigate to='/' replace />
              ) : (
                <Navigate to="/sign-in" replace />
              )
            )}

        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
