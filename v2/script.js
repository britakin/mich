const dialog = document.querySelector('#detail-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogContent = document.querySelector('#dialog-content');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

const news = {
  autumn: { title: 'Осенний субботник', text: 'Приглашаем на уборку территории в субботу, 2 ноября. Вместе сделаем наше товарищество чище и уютнее. Возьмите с собой перчатки, грабли и хорошее настроение.' },
  water: { title: 'График подачи воды в ноябре', text: 'Подача воды — ежедневно с 08:00 до 12:00 и с 18:00 до 21:00. Информация о возможных отключениях появится в новостях товарищества.' },
  winter: { title: 'Подготовка к зимнему периоду', text: 'Перекройте воду и слейте её из труб, шлангов и накопительных ёмкостей. Уберите садовое оборудование в сухое помещение и проверьте надёжность укрытий растений.' }
};
const topics = {
  documents: { title: 'Документы СНТ', html: '<p>Раздел для устава товарищества, положений, протоколов и форм заявлений.</p><p class="dialog-note">Это демонстрационная вёрстка. Официальные документы пока не добавлены.</p>' },
  board: { title: 'Правление СНТ', html: '<p>Здесь будут размещены состав правления, часы приёма и порядок подачи обращений.</p><p class="dialog-note">Контактные данные необходимо заполнить перед запуском сайта.</p>' },
  contacts: { title: 'Контакты правления', html: '<p>Контакты и часы приёма правления появятся в этом разделе.</p><p class="dialog-note">Телефон, электронная почта и адрес не указаны в исходном макете.</p>' },
  meetings: { title: 'Собрания товарищества', html: '<p>Дата ближайшего собрания пока не опубликована. Здесь будут доступны повестка и протоколы собраний.</p>' },
  improvement: { title: 'Благоустройство', html: '<p>Ближайшая работа из новостей — осенний субботник. Приглашаем садоводов присоединиться к уборке территории.</p>' },
  rules: { title: 'Правила СНТ', html: '<p>Раздел для правил товарищества и памяток посетителям.</p><p class="dialog-note">Официальные правила необходимо добавить перед запуском сайта.</p>' },
  map: { title: 'Схема участков', html: '<img class="dialog-map" src="assets/map.jpg" alt="Схема участков СНТ Мичуринец"><p class="dialog-note">Иллюстрация из макета. Для интерактивной карты нужны реальные координаты и границы участков.</p>' },
  news: { title: 'Все новости СНТ', html: Object.values(news).map(article => `<h3>${article.title}</h3><p>${article.text}</p><br>`).join('') }
};

function showDialog(title, html) {
  dialogTitle.textContent = title;
  dialogContent.innerHTML = `<div class="dialog-copy">${html}</div>`;
  dialog.showModal();
}

function showLocalForm(kind) {
  const titles = { problem: 'Сообщить о проблеме', idea: 'Предложить идею', signup: 'Записаться на собрание' };
  const message = kind === 'signup' ? '' : '<label>Ваше сообщение<textarea name="message" required placeholder="Расскажите подробнее"></textarea></label>';
  showDialog(titles[kind], `<form class="local-form"><label>Ваше имя<input name="name" autocomplete="name" required placeholder="Имя и фамилия"></label><label>Телефон или электронная почта<input name="contact" required placeholder="Для обратной связи"></label>${message}<p class="dialog-note">Демо-форма: данные можно сохранить в этом браузере. Отправка в правление не подключена.</p><button class="primary-button" type="submit">Сохранить черновик</button><p class="form-status" hidden role="status"></p></form>`);
  dialog.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const status = dialog.querySelector('.form-status');
    status.hidden = false;
    try {
      localStorage.setItem(`michurinets-draft-${kind}`, JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      status.textContent = 'Черновик сохранён в этом браузере. В правление он не отправлен.';
    } catch {
      status.textContent = 'Браузер не разрешил сохранить черновик. Скопируйте текст обращения.';
    }
  });
  try {
    const draft = JSON.parse(localStorage.getItem(`michurinets-draft-${kind}`) || 'null');
    if (draft) for (const field of dialog.querySelector('form').elements) if (field.name && Object.hasOwn(draft, field.name)) field.value = draft[field.name];
  } catch { /* The form remains available when browser storage is disabled. */ }
}

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', expanded);
});

navigation.addEventListener('click', event => {
  if (!event.target.closest('a, button')) return;
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
});

document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => {
  const topic = button.dataset.topic;
  if (['problem', 'idea', 'signup'].includes(topic)) return showLocalForm(topic);
  if (Object.hasOwn(topics, topic)) showDialog(topics[topic].title, topics[topic].html);
}));
document.querySelectorAll('[data-news]').forEach(button => button.addEventListener('click', () => {
  const article = news[button.dataset.news];
  showDialog(article.title, `<p>${article.text}</p>`);
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});

const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#site-search');
document.querySelector('.search-toggle').addEventListener('click', () => {
  searchForm.hidden = !searchForm.hidden;
  if (!searchForm.hidden) searchInput.focus();
});
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelectorAll('.search-highlight').forEach(element => element.classList.remove('search-highlight'));
  const query = searchInput.value.trim().toLocaleLowerCase('ru');
  if (!query) return;
  const matches = [...document.querySelectorAll('.service, .secondary-services button, .news-item, .schedule-row, .quick-links button, .footer-inner section')].filter(element => element.textContent.toLocaleLowerCase('ru').includes(query));
  searchForm.querySelector('.search-result').textContent = matches.length ? `Найдено: ${matches.length}` : 'Ничего не найдено. Попробуйте другой запрос.';
  matches.forEach(element => element.classList.add('search-highlight'));
  matches[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function updateSchedule() {
  const summary = getScheduleSummary();
  document.querySelector('#water-next').textContent = summary.water;
  document.querySelector('#trash-next').textContent = summary.trash;
}
updateSchedule();
setInterval(updateSchedule, 60_000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateSchedule();
});
