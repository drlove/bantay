class ModelCardStorage {
  constructor() {
    this.db = null;
    this.dbName = 'model_cards.db';
    this.SQL = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sql.js.org/dist/sql-wasm.js';
      script.onload = async () => {
        try {
          this.SQL = await initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
          });
          
          const savedData = localStorage.getItem(this.dbName);
          if (savedData) {
            const data = new Uint8Array(JSON.parse(savedData));
            this.db = new this.SQL.Database(data);
          } else {
            this.db = new this.SQL.Database();
            this.createTables();
          }
          this.createTables();
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  createTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS model_cards (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        data TEXT NOT NULL
      )
    `);
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    const data = this.db.export();
    localStorage.setItem(this.dbName, JSON.stringify(Array.from(data)));
  }

  generateId() {
    return 'mc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getAll() {
    const results = this.db.exec('SELECT id, created_at, updated_at, data FROM model_cards ORDER BY created_at DESC');
    if (results.length === 0) return [];
    
    return results[0].values.map(row => ({
      ...JSON.parse(row[3]),
      id: row[0],
      createdAt: row[1],
      updatedAt: row[2]
    }));
  }

  getById(id) {
    const stmt = this.db.prepare('SELECT id, created_at, updated_at, data FROM model_cards WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.get();
      stmt.free();
      return {
        ...JSON.parse(row[3]),
        id: row[0],
        createdAt: row[1],
        updatedAt: row[2]
      };
    }
    stmt.free();
    return null;
  }

  save(cardData) {
    const now = new Date().toISOString();
    const id = cardData.id || this.generateId();
    const data = JSON.stringify(cardData);
    
    const existing = this.getById(id);
    if (existing) {
      this.db.run('UPDATE model_cards SET updated_at = ?, data = ? WHERE id = ?', [now, data, id]);
    } else {
      this.db.run('INSERT INTO model_cards (id, created_at, updated_at, data) VALUES (?, ?, ?, ?)', [id, now, now, data]);
    }
    
    this.saveToLocalStorage();
    return id;
  }

  delete(id) {
    this.db.run('DELETE FROM model_cards WHERE id = ?', [id]);
    this.saveToLocalStorage();
  }

  exportJSON() {
    const cards = this.getAll();
    return JSON.stringify(cards, null, 2);
  }

  importJSON(jsonString) {
    try {
      const cards = JSON.parse(jsonString);
      if (Array.isArray(cards)) {
        cards.forEach(card => {
          this.save(card);
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

window.ModelCardStorage = ModelCardStorage;
