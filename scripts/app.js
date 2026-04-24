class ModelCardApp {
  constructor() {
    this.storage = new ModelCardStorage();
    this.currentCardId = null;
    this.view = 'list';
  }

  async init() {
    await this.storage.init();
    this.registerServiceWorker();
    this.setupEventListeners();
    this.loadCards();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/scripts/sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
    }
  }

  setupEventListeners() {
    document.getElementById('newCardBtn').addEventListener('click', () => this.showForm());
    document.getElementById('cancelBtn').addEventListener('click', () => this.showList());
    document.getElementById('saveCardBtn').addEventListener('click', () => this.saveCard());
    document.getElementById('exportBtn').addEventListener('click', () => this.exportCards());
    document.getElementById('importBtn').addEventListener('click', () => this.importCards());
    document.getElementById('importFile').addEventListener('change', (e) => this.handleImport(e));
    document.getElementById('searchInput').addEventListener('input', (e) => this.filterCards(e.target.value));
    document.getElementById('generateCpeBtn').addEventListener('click', () => this.generateCpeUri());

    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        header.classList.toggle('collapsed');
        header.nextElementSibling.classList.toggle('collapsed');
      });
    });
  }

  loadCards() {
    const cards = this.storage.getAll();
    this.renderCards(cards);
  }

  filterCards(query) {
    const cards = this.storage.getAll();
    const filtered = cards.filter(card => {
      const searchText = query.toLowerCase();
      return (
        (card.modelDetails?.name || '').toLowerCase().includes(searchText) ||
        (card.modelDetails?.organization || '').toLowerCase().includes(searchText) ||
        (card.modelDetails?.modelType || '').toLowerCase().includes(searchText)
      );
    });
    this.renderCards(filtered);
  }

  renderCards(cards) {
    const container = document.getElementById('cardsList');
    
    if (cards.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No model cards yet.</p>
          <button class="btn btn-primary" onclick="app.showForm()">Create your first Model Card</button>
        </div>
      `;
      return;
    }

    container.innerHTML = cards.map(card => `
      <div class="card-item">
        <div class="card-header">
          <h3>${this.escapeHtml(card.modelDetails?.name || 'Untitled')}</h3>
          <span class="card-type">${this.escapeHtml(card.modelDetails?.modelType || 'Unknown type')}</span>
        </div>
        <p class="card-org">${this.escapeHtml(card.modelDetails?.organization || 'No organization')}</p>
        <p class="card-date">Created: ${new Date(card.createdAt).toLocaleDateString()}</p>
        <div class="card-actions">
          <button class="btn btn-sm" onclick="app.viewCard('${card.id}')">View</button>
          <button class="btn btn-sm" onclick="app.editCard('${card.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="app.deleteCard('${card.id}')">Delete</button>
          <button class="btn btn-sm" onclick="app.exportCard('${card.id}')">Export</button>
        </div>
      </div>
    `).join('');
  }

  showForm(cardData = null) {
    this.view = 'form';
    document.getElementById('listView').classList.add('hidden');
    document.getElementById('formView').classList.remove('hidden');
    document.getElementById('cardView').classList.add('hidden');
    
    if (cardData) {
      this.populateForm(cardData);
      this.currentCardId = cardData.id;
    } else {
      document.getElementById('modelCardForm').reset();
      this.currentCardId = null;
    }
    
    document.getElementById('formTitle').textContent = cardData ? 'Edit Model Card' : 'New Model Card';
  }

  populateForm(cardData) {
    const fields = [
      'name', 'organization', 'modelDate', 'modelVersion', 'modelType',
      'trainingAlgorithms', 'paperUrl', 'citationDetails', 'license', 'contactEmail', 'contactPerson',
      'cpePart', 'cpeVendor', 'cpeProduct', 'cpeVersion', 'cpeUpdate', 'cpeEdition',
      'cpeLanguage', 'cpeSwEdition', 'cpeTargetSw', 'cpeTargetHw', 'cpeOther', 'cpeUri',
      'primaryUses', 'primaryUsers', 'outOfScopeUses',
      'relevantFactors', 'evaluationFactors',
      'performanceMeasures', 'decisionThresholds', 'uncertaintyApproach',
      'evaluationDatasets', 'evaluationMotivation', 'evaluationPreprocessing',
      'trainingDataOverview',
      'unitaryResults', 'intersectionalResults',
      'ethicalData', 'ethicalHumanLife', 'ethicalMitigations', 'ethicalRisks', 'ethicalUseCases',
      'caveats', 'recommendations'
    ];

    fields.forEach(field => {
      const el = document.getElementById(field);
      if (el && cardData.modelDetails?.[field] !== undefined) {
        el.value = cardData.modelDetails[field] || '';
      } else if (el) {
        const section = this.getFieldSection(field);
        if (section && cardData[section]?.[field] !== undefined) {
          el.value = cardData[section][field] || '';
        }
      }
    });
  }

  getFieldSection(field) {
    const sections = {
      name: 'modelDetails', organization: 'modelDetails', modelDate: 'modelDetails',
      modelVersion: 'modelDetails', modelType: 'modelDetails', trainingAlgorithms: 'modelDetails',
      paperUrl: 'modelDetails', citationDetails: 'modelDetails', license: 'modelDetails',
      contactEmail: 'modelDetails',
      contactPerson: 'modelDetails',
      cpePart: 'cpe', cpeVendor: 'cpe', cpeProduct: 'cpe', cpeVersion: 'cpe',
      cpeUpdate: 'cpe', cpeEdition: 'cpe', cpeLanguage: 'cpe', cpeSwEdition: 'cpe',
      cpeTargetSw: 'cpe', cpeTargetHw: 'cpe', cpeOther: 'cpe', cpeUri: 'cpe',
      primaryUses: 'intendedUse', primaryUsers: 'intendedUse', outOfScopeUses: 'intendedUse',
      relevantFactors: 'factors', evaluationFactors: 'factors',
      performanceMeasures: 'metrics', decisionThresholds: 'metrics', uncertaintyApproach: 'metrics',
      evaluationDatasets: 'evaluationData', evaluationMotivation: 'evaluationData',
      evaluationPreprocessing: 'evaluationData',
      trainingDataOverview: 'trainingData',
      unitaryResults: 'quantitativeAnalyses', intersectionalResults: 'quantitativeAnalyses',
      ethicalData: 'ethicalConsiderations', ethicalHumanLife: 'ethicalConsiderations',
      ethicalMitigations: 'ethicalConsiderations', ethicalRisks: 'ethicalConsiderations',
      ethicalUseCases: 'ethicalConsiderations',
      caveats: 'caveatsAndRecommendations', recommendations: 'caveatsAndRecommendations'
    };
    return sections[field];
  }

  collectFormData() {
    return {
      modelDetails: {
        name: document.getElementById('name').value,
        organization: document.getElementById('organization').value,
        modelDate: document.getElementById('modelDate').value,
        modelVersion: document.getElementById('modelVersion').value,
        modelType: document.getElementById('modelType').value,
        trainingAlgorithms: document.getElementById('trainingAlgorithms').value,
        paperUrl: document.getElementById('paperUrl').value,
        citationDetails: document.getElementById('citationDetails').value,
        license: document.getElementById('license').value,
        contactEmail: document.getElementById('contactEmail').value,
        contactPerson: document.getElementById('contactPerson').value
      },
      cpe: {
        cpePart: document.getElementById('cpePart').value,
        cpeVendor: document.getElementById('cpeVendor').value,
        cpeProduct: document.getElementById('cpeProduct').value,
        cpeVersion: document.getElementById('cpeVersion').value,
        cpeUpdate: document.getElementById('cpeUpdate').value,
        cpeEdition: document.getElementById('cpeEdition').value,
        cpeLanguage: document.getElementById('cpeLanguage').value,
        cpeSwEdition: document.getElementById('cpeSwEdition').value,
        cpeTargetSw: document.getElementById('cpeTargetSw').value,
        cpeTargetHw: document.getElementById('cpeTargetHw').value,
        cpeOther: document.getElementById('cpeOther').value,
        cpeUri: document.getElementById('cpeUri').value
      },
      intendedUse: {
        primaryUses: document.getElementById('primaryUses').value,
        primaryUsers: document.getElementById('primaryUsers').value,
        outOfScopeUses: document.getElementById('outOfScopeUses').value
      },
      factors: {
        relevantFactors: document.getElementById('relevantFactors').value,
        evaluationFactors: document.getElementById('evaluationFactors').value
      },
      metrics: {
        performanceMeasures: document.getElementById('performanceMeasures').value,
        decisionThresholds: document.getElementById('decisionThresholds').value,
        uncertaintyApproach: document.getElementById('uncertaintyApproach').value
      },
      evaluationData: {
        datasets: document.getElementById('evaluationDatasets').value,
        motivation: document.getElementById('evaluationMotivation').value,
        preprocessing: document.getElementById('evaluationPreprocessing').value
      },
      trainingData: {
        overview: document.getElementById('trainingDataOverview').value
      },
      quantitativeAnalyses: {
        unitaryResults: document.getElementById('unitaryResults').value,
        intersectionalResults: document.getElementById('intersectionalResults').value
      },
      ethicalConsiderations: {
        data: document.getElementById('ethicalData').value,
        humanLife: document.getElementById('ethicalHumanLife').value,
        mitigations: document.getElementById('ethicalMitigations').value,
        risks: document.getElementById('ethicalRisks').value,
        useCases: document.getElementById('ethicalUseCases').value
      },
      caveatsAndRecommendations: {
        caveats: document.getElementById('caveats').value,
        recommendations: document.getElementById('recommendations').value
      }
    };
  }

  saveCard() {
    const cardData = this.collectFormData();
    
    if (!cardData.modelDetails.name) {
      alert('Please enter a model name.');
      return;
    }

    cardData.id = this.currentCardId;
    const id = this.storage.save(cardData);
    this.currentCardId = id;
    
    this.showList();
    this.loadCards();
  }

  showList() {
    this.view = 'list';
    document.getElementById('listView').classList.remove('hidden');
    document.getElementById('formView').classList.add('hidden');
    document.getElementById('cardView').classList.add('hidden');
    this.loadCards();
  }

  viewCard(id) {
    const card = this.storage.getById(id);
    if (!card) return;

    document.getElementById('listView').classList.add('hidden');
    document.getElementById('formView').classList.add('hidden');
    document.getElementById('cardView').classList.remove('hidden');
    window.currentCardId = id;

    this.renderCardView(card);
  }

  renderCardView(card) {
    const container = document.getElementById('cardContent');
    container.innerHTML = `
      <h2>${this.escapeHtml(card.modelDetails?.name || 'Untitled')}</h2>
      
      <section class="card-section">
        <h3>Model Details</h3>
        <dl>
          <dt>Organization</dt><dd>${this.escapeHtml(card.modelDetails?.organization || '-')}</dd>
          <dt>Date</dt><dd>${this.escapeHtml(card.modelDetails?.modelDate || '-')}</dd>
          <dt>Version</dt><dd>${this.escapeHtml(card.modelDetails?.modelVersion || '-')}</dd>
          <dt>Type</dt><dd>${this.escapeHtml(card.modelDetails?.modelType || '-')}</dd>
          <dt>Training Algorithms</dt><dd>${this.escapeHtml(card.modelDetails?.trainingAlgorithms || '-')}</dd>
          <dt>Paper URL</dt><dd>${card.modelDetails?.paperUrl ? `<a href="${card.modelDetails.paperUrl}" target="_blank">${this.escapeHtml(card.modelDetails.paperUrl)}</a>` : '-'}</dd>
          <dt>Citation</dt><dd>${this.escapeHtml(card.modelDetails?.citationDetails || '-')}</dd>
          <dt>License</dt><dd>${this.escapeHtml(card.modelDetails?.license || '-')}</dd>
          <dt>Contact</dt><dd>${this.escapeHtml(card.modelDetails?.contactEmail || '-')}</dd>
          <dt>Contact Person</dt><dd>${this.escapeHtml(card.modelDetails?.contactPerson || '-')}</dd>
        </dl>
      </section>

      <section class="card-section">
        <h3>Common Platform Enumeration (CPE)</h3>
        <dl>
          ${card.cpe?.cpeUri ? `<dt>CPE 2.3 URI</dt><dd><code>${this.escapeHtml(card.cpe.cpeUri)}</code></dd>` : ''}
          <dt>Part</dt><dd>${this.escapeHtml(card.cpe?.cpePart || '-')}</dd>
          <dt>Vendor</dt><dd>${this.escapeHtml(card.cpe?.cpeVendor || '-')}</dd>
          <dt>Product</dt><dd>${this.escapeHtml(card.cpe?.cpeProduct || '-')}</dd>
          <dt>Version</dt><dd>${this.escapeHtml(card.cpe?.cpeVersion || '-')}</dd>
          <dt>Update</dt><dd>${this.escapeHtml(card.cpe?.cpeUpdate || '-')}</dd>
          <dt>Edition</dt><dd>${this.escapeHtml(card.cpe?.cpeEdition || '-')}</dd>
          <dt>Language</dt><dd>${this.escapeHtml(card.cpe?.cpeLanguage || '-')}</dd>
          <dt>Software Edition</dt><dd>${this.escapeHtml(card.cpe?.cpeSwEdition || '-')}</dd>
          <dt>Target Software</dt><dd>${this.escapeHtml(card.cpe?.cpeTargetSw || '-')}</dd>
          <dt>Target Hardware</dt><dd>${this.escapeHtml(card.cpe?.cpeTargetHw || '-')}</dd>
          <dt>Other</dt><dd>${this.escapeHtml(card.cpe?.cpeOther || '-')}</dd>
        </dl>
      </section>

      <section class="card-section">
        <h3>Intended Use</h3>
        <dl>
          <dt>Primary Uses</dt><dd>${this.escapeHtml(card.intendedUse?.primaryUses || '-')}</dd>
          <dt>Primary Users</dt><dd>${this.escapeHtml(card.intendedUse?.primaryUsers || '-')}</dd>
          <dt>Out-of-Scope Uses</dt><dd>${this.escapeHtml(card.intendedUse?.outOfScopeUses || '-')}</dd>
        </dl>
      </section>

      <section class="card-section">
        <h3>Factors</h3>
        <dl>
          <dt>Relevant Factors</dt><dd>${this.escapeHtml(card.factors?.relevantFactors || '-')}</dd>
          <dt>Evaluation Factors</dt><dd>${this.escapeHtml(card.factors?.evaluationFactors || '-')}</dd>
        </dl>
      </section>

      <section class="card-section">
        <h3>Metrics</h3>
        <dl>
          <dt>Performance Measures</dt><dd>${this.escapeHtml(card.metrics?.performanceMeasures || '-')}</dd>
          <dt>Decision Thresholds</dt><dd>${this.escapeHtml(card.metrics?.decisionThresholds || '-')}</dd>
          <dt>Uncertainty Approach</dt><dd>${this.escapeHtml(card.metrics?.uncertaintyApproach || '-')}</dd>
        </dl>
      </section>

      <section class="card-section">
        <h3>Evaluation Data</h3>
        <dl>
          <dt>Datasets</dt><dd>${this.escapeHtml(card.evaluationData?.datasets || '-')}</dd>
          <dt>Motivation</dt><dd>${this.escapeHtml(card.evaluationData?.motivation || '-')}</dd>
          <dt>Preprocessing</dt><dd>${this.escapeHtml(card.evaluationData?.preprocessing || '-')}</dd>
        </dl>
      </section>

      <section class="card-section">
        <h3>Training Data</h3>
        <p>${this.escapeHtml(card.trainingData?.overview || '-')}</p>
      </section>

      <section class="card-section">
        <h3>Quantitative Analyses</h3>
        <dl>
          <dt>Unitary Results</dt><dd>${this.escapeHtml(card.quantitativeAnalyses?.unitaryResults || '-')}</dd>
          <dt>Intersectional Results</dt><dd>${this.escapeHtml(card.quantitativeAnalyses?.intersectionalResults || '-')}</dd>
        </dl>
      </section>

      <section class="card-section">
        <h3>Ethical Considerations</h3>
        <dl>
          <dt>Data Concerns</dt><dd>${this.escapeHtml(card.ethicalConsiderations?.data || '-')}</dd>
          <dt>Human Life</dt><dd>${this.escapeHtml(card.ethicalConsiderations?.humanLife || '-')}</dd>
          <dt>Mitigations</dt><dd>${this.escapeHtml(card.ethicalConsiderations?.mitigations || '-')}</dd>
          <dt>Risks and Harms</dt><dd>${this.escapeHtml(card.ethicalConsiderations?.risks || '-')}</dd>
          <dt>Use Cases</dt><dd>${this.escapeHtml(card.ethicalConsiderations?.useCases || '-')}</dd>
        </dl>
      </section>

      <section class="card-section">
        <h3>Caveats and Recommendations</h3>
        <dl>
          <dt>Caveats</dt><dd>${this.escapeHtml(card.caveatsAndRecommendations?.caveats || '-')}</dd>
          <dt>Recommendations</dt><dd>${this.escapeHtml(card.caveatsAndRecommendations?.recommendations || '-')}</dd>
        </dl>
      </section>
    `;
  }

  generateCpeUri() {
    const v = (id) => document.getElementById(id).value.trim() || '*';
    const part = document.getElementById('cpePart').value || 'a';
    const uri = `cpe:2.3:${part}:${v('cpeVendor')}:${v('cpeProduct')}:${v('cpeVersion')}:${v('cpeUpdate')}:${v('cpeEdition')}:${v('cpeLanguage')}:${v('cpeSwEdition')}:${v('cpeTargetSw')}:${v('cpeTargetHw')}:${v('cpeOther')}`;
    document.getElementById('cpeUri').value = uri;
  }

  editCard(id) {
    const card = this.storage.getById(id);
    if (card) {
      this.showForm(card);
    }
  }

  deleteCard(id) {
    if (confirm('Are you sure you want to delete this model card?')) {
      this.storage.delete(id);
      this.loadCards();
    }
  }

  exportCard(id) {
    const card = this.storage.getById(id);
    if (card) {
      this.downloadJSON([card], `model_card_${id}.json`);
    }
  }

  exportCards() {
    const cards = this.storage.getAll();
    this.downloadJSON(cards, 'model_cards_export.json');
  }

  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  importCards() {
    document.getElementById('importFile').click();
  }

  handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.storage.importJSON(e.target.result)) {
        alert('Import successful!');
        this.loadCards();
      } else {
        alert('Import failed. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  printCard() {
    window.print();
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new ModelCardApp();
  app.init();
});
