class StorageObject {
  constructor(storageKey = null, limit = 12) {
    this.storageKey = storageKey || 'StorageObject';
    this.limit = limit;
  }

  add(data, ctx = null, offset = null) {
    const fn = this.constructor.receiveEntry;
    const entry = data ? fn(data) : fn.call(ctx);

    this.remove(entry, ctx);

    let entries = this.entries();

    while ((entries.length + 1) > this.limit) entries.shift();

    if (offset != null) {
      entries.splice(offset, 0, entry)
    } else entries.push(entry);

    StorageObject.setEntries.call(this, entries);
  }

  remove(data, ctx = null) {
    let index = -1;
    const fn = this.constructor.receiveEntry;
    const entry = data ? fn(data) : fn.call(ctx);
    if (StorageObject.getStorage.call(this) && this.has(entry) > -1) {
      index = this.has(entry);
      StorageObject.setEntries.call(this, StorageObject.entriesExceptReceived.call(this, entry))
    }
    return index;
  }

  removeByIndex(index) {
    let entries = this.entries();

    entries.reverse()
    entries.splice(index, 1);
    entries.reverse()

    StorageObject.setEntries.call(this, entries);
  }

  clear() {
    localStorage.setItem(this.storageKey, null)
  }

  has(entry, ctx = this) {
    const fn = this.constructor.receiveEntry;
    return StorageObject.getStorage.call(this) ? this.entries().findIndex(item => StorageObject.equalEntries(item, entry ? fn(entry) : fn.call(ctx))) : -1
  }

  entries(reverse = false) {
    const fn = StorageObject.getStorage.bind(this);
    const parse = JSON.parse(fn());
    return fn() ? reverse ? parse.reverse() : parse : [];
  }

  get count() {
    return StorageObject.getStorage.call(this) ? this.entries().length : 0;
  }

  static entriesExceptReceived(entry) {
    return this.entries().filter(item => !StorageObject.equalEntries(item, entry))
  }

  static equalEntries(item, entry) {
    return JSON.stringify(item) === JSON.stringify(entry)
  }

  static receiveEntry(data = null) {
    return data === null ? this.data : data
  }

  static setEntries(entries) {
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }

  static getStorage() {
    const item = localStorage.getItem(this.storageKey);
    return item !== 'null' ? item : false
  }
}
