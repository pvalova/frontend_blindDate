const API_URL = process.env.REACT_APP_API_URL || 'https://blinddatebackend.azurewebsites.net';

// Get all swap themes
export const getSwapThemes = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/swaps/themes`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch swap themes');
  }
  
  return await response.json();
};

export const joinSwap = async (themeId, bookId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/swaps/join/${themeId}?book_id=${bookId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    // Enhanced error handling
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to join swap');
    } catch (parseError) {
      throw new Error(`Failed to join swap (Status ${response.status})`);
    }
  }
  
  return await response.json();
};

// Get active swaps for current user
export const getActiveSwaps = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/swaps/active`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch active swaps');
  }
  
  return await response.json();
};

// Get swap history for current user
export const getSwapHistory = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/swaps/history`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch swap history');
  }
  
  return await response.json();
};

export const getUserBooks = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/books/my-collection`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch your books');
  }
  
  return await response.json();
};