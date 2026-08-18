const pages = [...document.querySelectorAll('.page')];
const nav = [...document.querySelectorAll('.nav-link[data-page]')];
const title = document.querySelector('#page-title');
const toast = document.querySelector('.toast');
const modal = document.querySelector('.modal-backdrop');
const titles = { overview: '恢复总览', schedule: '随访计划', records: '随访记录', assessment: '量表评估', files: '检查资料', team: '医疗团队', contact: '联系我们', community: '病友经验', education: '健康宣教' };
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function showPage(name) {
  pages.forEach((page) => page.classList.toggle('active', page.dataset.view === name));
  nav.forEach((item) => item.classList.toggle('active', item.dataset.page === name));
  title.textContent = titles[name];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

nav.forEach((item) => item.addEventListener('click', () => showPage(item.dataset.page)));
document.querySelectorAll('[data-go]').forEach((item) => item.addEventListener('click', () => showPage(item.dataset.go)));
document.querySelectorAll('[data-open-modal]').forEach((item) => item.addEventListener('click', openModal));
document.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.querySelector('[data-save]').addEventListener('click', () => { closeModal(); notify('随访记录已保存，医生会在审核后回复'); });
document.querySelectorAll('[data-upload]').forEach((item) => item.addEventListener('click', () => notify('原型演示：已打开检查资料上传入口')));
document.querySelectorAll('[data-lesson]').forEach((item) => item.addEventListener('click', () => notify('原型演示：课程内容即将开始')));
document.querySelector('[data-copy-guide]').addEventListener('click', () => notify('入群指引已复制：扫码入群后备注“研究编号后四位 + 昵称”'));
document.querySelector('[data-feedback-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('[data-ticket-status]').textContent = '已提交，等待回复';
  document.querySelector('[data-ticket-status]').classList.add('submitted');
  notify('问题已提交给后台，医生回复会显示在“我的反馈”');
  event.currentTarget.reset();
});
document.querySelector('[data-share-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const nickname = form.elements.nickname.value.trim();
  const content = form.elements.content.value.trim();
  if (!nickname || !content) return;
  const post = document.createElement('article');
  post.className = 'community-post new-post';
  const head = document.createElement('div');
  head.className = 'post-head';
  const avatar = document.createElement('div');
  avatar.className = 'post-avatar';
  avatar.textContent = nickname.slice(0, 1);
  const author = document.createElement('div');
  const authorName = document.createElement('b');
  authorName.textContent = nickname;
  const time = document.createElement('small');
  time.textContent = '刚刚 · 经验分享';
  author.append(authorName, time);
  const more = document.createElement('button');
  more.className = 'more-button';
  more.setAttribute('aria-label', '更多');
  more.textContent = '···';
  head.append(avatar, author, more);
  const body = document.createElement('p');
  body.textContent = content;
  const actions = document.createElement('div');
  actions.className = 'post-actions';
  actions.innerHTML = '<button class="like-button">♡ <span>0</span></button><button>评论 0</button><span>仅供经验交流</span>';
  post.append(head, body, actions);
  document.querySelector('[data-community-feed]').prepend(post);
  form.reset();
  actions.querySelector('.like-button').addEventListener('click', (clickEvent) => {
    const count = clickEvent.currentTarget.querySelector('span');
    count.textContent = Number(count.textContent) + 1;
    clickEvent.currentTarget.classList.add('liked');
  });
  notify('经验已发布，感谢你的分享');
});
document.querySelectorAll('.like-button').forEach((button) => {
  button.addEventListener('click', () => {
    const count = button.querySelector('span');
    count.textContent = Number(count.textContent) + 1;
    button.classList.add('liked');
  });
});
document.querySelector('.check-task').addEventListener('click', (event) => {
  event.currentTarget.textContent = '已完成';
  event.currentTarget.style.color = '#4c9b75';
  event.currentTarget.style.background = '#e1f3e7';
  notify('睡前放松练习已加入完成记录');
});
document.querySelectorAll('.modal input[type="range"]').forEach((input) => {
  input.addEventListener('input', (event) => {
    event.target.previousElementSibling.textContent = `${event.target.value} / 10`;
  });
});
document.querySelectorAll('.filter').forEach((item) => item.addEventListener('click', () => {
  item.parentElement.querySelectorAll('.filter').forEach((filter) => filter.classList.remove('active'));
  item.classList.add('active');
}));
document.querySelectorAll('.edu-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const detail = button.closest('.edu-detail');
    detail.classList.toggle('open');
    button.querySelector('strong').textContent = detail.classList.contains('open') ? '⌃' : '⌄';
  });
});

const scaleTabs = [...document.querySelectorAll('.assessment-tab')];
const scalePanels = [...document.querySelectorAll('.assessment-panel')];
const eckardtFields = ['dysphagia', 'regurgitation', 'chestPain', 'weightLoss'];
const gerdqFields = ['heartburn', 'gerdRegurgitation', 'epigastricPain', 'nausea', 'sleepImpact', 'extraMedication'];
const stoolerLabels = ['可以正常饮食', '可以进软食', '可以进半流质', '只能进流质', '液体也难以下咽'];

function updateEckardtScore() {
  const total = eckardtFields.reduce((sum, field) => {
    const selected = document.querySelector(`input[name="${field}"]:checked`);
    return sum + Number(selected?.value || 0);
  }, 0);
  document.querySelector('[data-eckardt-total]').textContent = total;
  document.querySelector('[data-eckardt-label]').textContent = total <= 3 ? '低症状负担' : total <= 6 ? '建议带给医生复核' : '建议尽快联系医疗团队';
}

function updateStoolerScore() {
  const selected = document.querySelector('input[name="stooler"]:checked');
  const total = Number(selected?.value || 0);
  document.querySelector('[data-stooler-total]').textContent = total;
  document.querySelector('[data-stooler-label]').textContent = stoolerLabels[total];
}

function updateGerdqScore() {
  const total = gerdqFields.reduce((sum, field) => {
    const selected = document.querySelector(`input[name="${field}"]:checked`);
    return sum + Number(selected?.value || 0);
  }, 0);
  document.querySelector('[data-gerdq-total]').textContent = total;
  document.querySelector('[data-gerdq-label]').textContent = total >= 8 ? '建议由医生进一步评估' : '反流相关影响较低';
}

function switchScale(scale) {
  scaleTabs.forEach((tab) => {
    const active = tab.dataset.scale === scale;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  scalePanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.scalePanel === scale));
}

scaleTabs.forEach((tab) => tab.addEventListener('click', () => switchScale(tab.dataset.scale)));
document.querySelectorAll('input[name="dysphagia"], input[name="regurgitation"], input[name="chestPain"], input[name="weightLoss"]').forEach((input) => input.addEventListener('change', updateEckardtScore));
document.querySelectorAll('input[name="stooler"]').forEach((input) => input.addEventListener('change', updateStoolerScore));
document.querySelectorAll('input[name="heartburn"], input[name="gerdRegurgitation"], input[name="epigastricPain"], input[name="nausea"], input[name="sleepImpact"], input[name="extraMedication"]').forEach((input) => input.addEventListener('change', updateGerdqScore));
document.querySelectorAll('[data-save-assessment]').forEach((button) => {
  button.addEventListener('click', () => {
    const scaleKey = button.closest('.assessment-panel').dataset.scalePanel;
    const scale = scaleKey === 'eckardt' ? 'Eckardt 评分' : scaleKey === 'stooler' ? 'Stooler 分级' : 'GERD-Q 评分';
    notify(`${scale}已保存到本次随访记录`);
  });
});
updateEckardtScore();
updateStoolerScore();
updateGerdqScore();
