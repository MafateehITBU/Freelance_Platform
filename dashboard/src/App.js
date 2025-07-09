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
import OrdersPage from "./pages/OrdersPage";
import RatingsPage from "./pages/RatingsPage";
import PostsPage from "./pages/PostsPage";
import WalletsPage from "./pages/WalletsPage";
import ProfilePage from "./pages/ProfilePage";

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
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/subscription-plans" element={<SubscriptionPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/ratings" element={<RatingsPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/wallets" element={<WalletsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        
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
