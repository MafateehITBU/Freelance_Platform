import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { useAuth } from '../context/AuthContext';
import { parseISO } from "date-fns";

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route
  const navigate = useNavigate();
  const { user, loading, logout, notifications, removeNotification } = useAuth();

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  // Helper function to calculate time difference
  const timeAgo = (date) => {
    const now = new Date();
    const createdAt = parseISO(date);

    if (isNaN(createdAt)) {
      return "Invalid date";
    }

    const timeDifference = now - createdAt;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  const renderNotifications = () => {
    if (notifications.length === 0) {
      return (
        <p className="text-center py-12 px-16">No new notifications</p>
      );
    }

    console.log("Notifications:", notifications);

    // Reverse the notifications array to show recent notifications first
    const recentNotifications = [...notifications].reverse(); // Create a new array with reversed order

    return recentNotifications.map((notification, index) => (
      <Link
        to={notification.route}
        key={notification.notifID}
        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
        onClick={() => removeNotification(notification.notifID)}  // Remove the notification on click
      >
        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
          <span className="w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
            <Icon
              icon="bitcoin-icons:verify-outline"
              className="icon text-xxl"
            />
          </span>
          <div>
            <h6 className="text-md fw-semibold mb-4">{notification.title}</h6>
            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
              {notification.message}
            </p>
          </div>
        </div>
        <span className="text-sm text-secondary-light flex-shrink-0">
          {timeAgo(notification.createdAt) || "Just now"}
        </span>
      </Link>
    ));
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        <div>
          <Link to='/' className='sidebar-logo'>
            <img
              src='/assets/images/freelancer/no-bg.png'
              alt='site logo'
              className='light-logo'
            />
            <img
              src='/assets/images/freelancer/no-bg.png'
              alt='site logo'
              className='dark-logo'
            />
            <img
              src='/assets/images/freelancer/no-bg.png'
              alt='site logo'
              className='logo-icon'
            />
          </Link>
        </div>
        <div className='sidebar-menu-area'>
          <ul className='sidebar-menu' id='sidebar-menu'>
            {user && (
              <>
                {/* Dashboard */}
                <li>
                  <NavLink
                    to='/'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='line-md:home-simple-twotone'
                      className='menu-icon'
                    />
                    <span>Dashboard</span>
                  </NavLink>
                </li>

                {/* Freelancers */}
                <li>
                  <NavLink
                    to='/freelancers'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='line-md:account'
                      className='menu-icon'
                    />
                    <span>Freelancers</span>
                  </NavLink>
                </li>

                {/* Influencers */}
                <li>
                  <NavLink
                    to='/influencers'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='line-md:account'
                      className='menu-icon'
                    />
                    <span>Influencers</span>
                  </NavLink>
                </li>

                {/* Users */}
                <li>
                  <NavLink
                    to='/users'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='line-md:account'
                      className='menu-icon'
                    />
                    <span>Users</span>
                  </NavLink>
                </li>

                {/* Categories */}
                <li>
                  <NavLink
                    to='/categories'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='material-symbols:category-rounded'
                      className='menu-icon'
                    />
                    <span>Categories</span>
                  </NavLink>
                </li>

                {/* Services */}
                <li>
                  <NavLink
                    to='/services'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='material-symbols:medical-services-outline'
                      className='menu-icon'
                    />
                    <span>Services</span>
                  </NavLink>
                </li>

                {/* Subscription Plans */}
                <li>
                  <NavLink
                    to='/subscription-plans'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='material-symbols:subscriptions-outline-rounded'
                      className='menu-icon'
                    />
                    <span>Subscription Plans</span>
                  </NavLink>
                </li>

                {/* Orders */}
                <li>
                  <NavLink
                    to='/orders'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='material-symbols:order-approve-outline'
                      className='menu-icon'
                    />
                    <span>Orders</span>
                  </NavLink>
                </li>

                {/* Ratings */}
                <li>
                  <NavLink
                    to='/ratings'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='material-symbols:18-up-rating-outline-rounded'
                      className='menu-icon'
                    />
                    <span>Ratings</span>
                  </NavLink>
                </li>

                {/* Posts */}
                <li>
                  <NavLink
                    to='/posts'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='material-symbols:post-add-rounded'
                      className='menu-icon'
                    />
                    <span>Posts</span>
                  </NavLink>
                </li>

                {/* Wallets */}
                <li>
                  <NavLink
                    to='/wallets'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='material-symbols:account-balance-wallet-outline'
                      className='menu-icon'
                    />
                    <span>Wallets</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  className='sidebar-toggle'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* ThemeToggleButton */}
                <ThemeToggleButton />

                {/* Add notifications */}
                <div className="dropdown">
                  <button
                    className="has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <Icon
                      icon="iconoir:bell"
                      className="text-primary-light text-xl"
                    />
                    {/* Show red circle if there are notifications */}
                    {notifications.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-lg p-0">
                    <div className="m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-0">
                          Notifications
                        </h6>
                      </div>
                      <span className="text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center">
                        {notifications.length}
                      </span>
                    </div>
                    <div className="max-h-400-px overflow-y-auto scroll-sm pe-4">
                      {renderNotifications()}
                    </div>
                  </div>
                </div>
                {/* Notification dropdown end */}
                <div className='dropdown'>
                  <button
                    className='d-flex justify-content-center align-items-center rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    {loading ? (
                      <div className="w-40-px h-40-px rounded-circle bg-neutral-200 animate-pulse" />
                    ) : (
                      <img
                        src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=128`}
                        alt='user'
                        className='w-40-px h-40-px object-fit-cover rounded-circle'
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=128`;
                        }}
                      />
                    )}
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                          {loading ? (
                            <div className="h-6 w-32 bg-neutral-200 rounded animate-pulse" />
                          ) : (
                            user?.name || user?.email || 'User'
                          )}
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                          {loading ? (
                            <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                          ) : (
                            user?.position || 'Admin'
                          )}
                        </span>
                      </div>
                      <button type='button' className='hover-text-danger'>
                        <Icon icon='radix-icons:cross-1' className='icon text-xl' />
                      </button>
                    </div>
                    <ul className='to-top-list'>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/profile'
                        >
                          <Icon
                            icon='solar:user-linear'
                            className='icon text-xl'
                          />{" "}
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3 w-100'
                        >
                          <Icon icon='lucide:power' className='icon text-xl' />{" "}
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>{children}</div>
      </main>
    </section >
  );
};

export default MasterLayout;
