// Supabase client — direct REST calls against PostgREST.
// Publishable key is safe to ship; mutations go through SECURITY DEFINER
// RPC functions that enforce per-group passwords in SQL.

const SUPABASE_URL = 'https://nruwjwaoqsnztpdjmhjf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QTzlAkEYo879ARlPtAMPXA_6Xd0--Jm';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

async function restGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return res.json();
}

async function rpc(fn, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) {
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.hint || parsed.error || text;
    } catch {}
    throw new Error(message || `HTTP ${res.status}`);
  }
  return text ? JSON.parse(text) : null;
}

window.db = {
  async listGroups() {
    return restGet('groups?select=id,name,created_at&order=created_at.desc');
  },
  async getGroup(id) {
    const rows = await restGet(
      `groups?select=id,name,created_at,words(id,greek_word,english_translation)&id=eq.${encodeURIComponent(id)}`
    );
    return rows[0] || null;
  },
  async createGroup({ name, password, words }) {
    return rpc('create_group', {
      p_name: name,
      p_password: password,
      p_words: words
    });
  },
  async verifyPassword(groupId, password) {
    return rpc('verify_group_password', {
      p_group_id: groupId,
      p_password: password
    });
  },
  async updateGroup({ id, password, name, words }) {
    return rpc('update_group', {
      p_group_id: id,
      p_password: password,
      p_name: name,
      p_words: words
    });
  },
  async deleteGroup({ id, password }) {
    return rpc('delete_group', {
      p_group_id: id,
      p_password: password
    });
  }
};
