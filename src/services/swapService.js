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

// Join a swap with a book
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
    const error = await response.json();
    throw new Error(error.detail || 'Failed to join swap');
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

// Get user's books for swap selection
export const getUserBooks = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/books/my-books`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 422) {
        // The 422 might mean the user has no books or there's a schema validation issue
        // Return an empty array in this case
        console.warn("Received 422 from /books/my-books - treating as empty list");
        return [];
      }
      throw new Error('Failed to fetch your books');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error in getUserBooks:", error);
    // Return empty array instead of throwing
    return [];
  }
};