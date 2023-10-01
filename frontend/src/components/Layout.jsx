import React, { useState } from 'react';
import IconLogout from './icons/IconLogout.jsx';
import PropTypes from 'prop-types';

const Layout = ({ children, showMenu = false, disconnectUser }) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = (e) => {
    e.preventDefault();
    setIsDisconnecting(true);
    setTimeout(() => {
      disconnectUser();
      setIsDisconnecting(false);
    }, 1500);
  };

  return (
    <div className="layout">
      <div className="title-menu">
        <h1>Sample app</h1>
        {showMenu && (
          <div className="menu">
            <button onClick={handleDisconnect} disabled={isDisconnecting}>
              <div className="menu-icon">
                <IconLogout />
              </div>
              <span className="hidden-mobile">
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect account'}
              </span>
            </button>
          </div>
        )}
      </div>
      <main>{children}</main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.element.isRequired,
  showMenu: PropTypes.bool.isRequired,
  disconnectUser: PropTypes.func,
};

export default Layout;
