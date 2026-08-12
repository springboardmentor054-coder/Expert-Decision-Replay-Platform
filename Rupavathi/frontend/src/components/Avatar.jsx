import { API_BASE_URL } from '../services/api';

function Avatar({ user, fallbackChar }) {
  const avatarUrl = user?.avatarUrl;

  if (avatarUrl) {
    return <img src={`${API_BASE_URL}${avatarUrl}`} alt="" className="avatar-img" />;
  }

  return <>{fallbackChar || user?.email?.charAt(0).toUpperCase() || 'U'}</>;
}

export default Avatar;
