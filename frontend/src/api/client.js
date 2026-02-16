// API Client - Centralized HTTP requests to backend

const API_BASE_URL = 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============ CLINICIANS ============

export async function getClinicians() {
  const result = await request('/clinicians');
  return result.data;
}

export async function createClinician(data) {
  const result = await request('/clinicians', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.data;
}

// ============ PATIENTS ============

export async function getPatients() {
  const result = await request('/patients');
  return result.data;
}

export async function createPatient(data) {
  const result = await request('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.data;
}

// ============ VISITS ============

export async function getVisits(filters = {}) {
  // Build query string from filters
  const params = new URLSearchParams();
  
  if (filters.clinician_id) params.append('clinician_id', filters.clinician_id);
  if (filters.patient_id) params.append('patient_id', filters.patient_id);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/visits?${queryString}` : '/visits';
  
  const result = await request(endpoint);
  return result.data;
}

export async function createVisit(data) {
  const result = await request('/visits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.data;
}

export async function updateVisit(id, data) {
  const result = await request(`/visits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return result.data;
}

export async function deleteVisit(id) {
  const result = await request(`/visits/${id}`, {
    method: 'DELETE',
  });
  return result;
}
