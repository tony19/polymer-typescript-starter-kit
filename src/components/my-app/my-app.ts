@component('my-app')
class MyApp extends polymer.Base {
  @property({type: String, reflectToAttribute: true})
  page: string;

  @observe('routeData.page')
  _routePageChanged(page: string) {
    this.page = page || 'view1';

    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  @observe('page')
  _pageChanged(page: string) {
    // Load page import on demand. Show 404 page if fails
    const resolvedPageUrl = this.resolveUrl(`../my-${page}/my-${page}.html`);
    this.importHref(resolvedPageUrl, undefined, this._showPage404, true);
  }

  _showPage404() {
    this.page = 'view404';
  }
}
MyApp.register();
