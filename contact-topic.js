(() => {
  const select = document.querySelector('#contact-topic');
  if (!select) return;

  const field = select.closest('.topic-field');
  const label = field.querySelector('label');
  const choices = Array.from(select.options).filter(option => option.value);
  const widget = document.createElement('div');
  const trigger = document.createElement('button');
  const display = document.createElement('span');
  const chevron = document.createElement('span');
  const listbox = document.createElement('div');
  const error = document.createElement('p');

  widget.className = 'topic-combobox';
  trigger.id = 'contact-topic-trigger';
  trigger.type = 'button';
  trigger.className = 'topic-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'contact-topic-listbox');
  trigger.setAttribute('aria-labelledby', 'contact-topic-label contact-topic-display');
  label.id = 'contact-topic-label';
  label.htmlFor = trigger.id;

  display.id = 'contact-topic-display';
  display.textContent = select.selectedOptions[0]?.textContent || 'Choose a topic';
  chevron.className = 'topic-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  trigger.append(display, chevron);

  listbox.id = 'contact-topic-listbox';
  listbox.className = 'topic-listbox';
  listbox.setAttribute('role', 'listbox');
  listbox.setAttribute('aria-labelledby', label.id);
  listbox.hidden = true;

  error.className = 'topic-error';
  error.id = 'contact-topic-error';
  error.textContent = 'Choose a topic before sending your message.';
  error.hidden = true;

  const options = choices.map((choice, index) => {
    const option = document.createElement('div');
    option.id = `contact-topic-option-${index}`;
    option.className = 'topic-option';
    option.textContent = choice.textContent;
    option.dataset.value = choice.value;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(select.value === choice.value));
    option.tabIndex = -1;
    listbox.append(option);
    return option;
  });

  widget.append(trigger, listbox, error);
  field.append(widget);
  if (select.value) widget.classList.add('has-value');
  select.classList.add('topic-native-hidden');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  select.required = false;

  const activeIndex = () => Math.max(0, choices.findIndex(choice => choice.value === select.value));
  const focusOption = index => options[(index + options.length) % options.length].focus();
  const close = (restoreFocus = false) => {
    listbox.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    widget.classList.remove('is-open');
    if (restoreFocus) trigger.focus();
  };
  const open = (index = activeIndex()) => {
    listbox.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    widget.classList.add('is-open');
    focusOption(index);
  };
  const choose = option => {
    select.value = option.dataset.value;
    display.textContent = option.textContent;
    widget.classList.add('has-value');
    trigger.removeAttribute('aria-invalid');
    trigger.removeAttribute('aria-describedby');
    error.hidden = true;
    options.forEach(item => item.setAttribute('aria-selected', String(item === option)));
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close(true);
  };

  trigger.addEventListener('click', () => listbox.hidden ? open() : close());
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const index = event.key === 'ArrowUp' || event.key === 'End' ? options.length - 1 : activeIndex();
      open(index);
    }
  });
  listbox.addEventListener('click', event => {
    const option = event.target.closest('.topic-option');
    if (option) choose(option);
  });
  listbox.addEventListener('keydown', event => {
    const current = options.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption(current + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(options[current]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else if (event.key === 'Tab') {
      close();
    }
  });
  document.addEventListener('pointerdown', event => {
    if (!widget.contains(event.target)) close();
  });
  widget.addEventListener('focusout', event => {
    if (!widget.contains(event.relatedTarget)) close();
  });
  field.closest('form').addEventListener('submit', event => {
    if (select.value) return;
    event.preventDefault();
    trigger.setAttribute('aria-invalid', 'true');
    trigger.setAttribute('aria-describedby', error.id);
    error.hidden = false;
    trigger.focus();
  });
})();
