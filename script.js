define([
    'json!./manifest.json',
    'underscore',
    './js/views/settings.js',
    './js/views/leads_list.js',
    './js/helpers/container.js',

    './js/bootstrap.js'
  ],
  /**
   * @param {Manifest} manifest
   * @param {Array.<String>} manifest.widget.locale
   * @param {Boolean} manifest.widget.installation
   * @param {Number} manifest.widget.interface_version
   * @param {UnderscoreStatic} _
   * @param {SampleWidgetSettings} Settings
   * @param {SampleWidgetLeadsListView} LeadsList
   * @param {Object} Container
   * @param {function} bootstrap
   * @return {Function}
   */
  function (manifest,
            _,
            Settings,
            LeadsList,
            Container,
            bootstrap) {
    /**
     * @typedef {Object} Manifest
     * @property {Object} widget
     * @property {String} widget.name
     * @property {String} widget.description
     * @property {String} widget.short_description
     * @property {String} widget.code
     * @property {String} widget.secret_key
     * @property {String} widget.version
     */

    /**
     * @typedef {Object} WidgetSystemObject
     * @property {String} area
     * @property {Number} displayed_count
     * @property {Object} displayed_count_by_area
     * @property {Number|undefined} displayed_count_by_area.companies_card
     * @property {Number|undefined} displayed_count_by_area.contacts_card
     * @property {Number|undefined} displayed_count_by_area.leads_card
     * @property {Number|undefined} displayed_count_by_area.customers_card
     * @property {Number|undefined} displayed_count_by_area.contacts
     * @property {Number|undefined} displayed_count_by_area.leads
     * @property {Number|undefined} displayed_count_by_area.customers
     * @property {Number|undefined} displayed_count_by_area.dashboard
     * @property {Number|undefined} displayed_count_by_area.todo
     * @property {Number|undefined} displayed_count_by_area.widgetsSettings
     * @property {Number|undefined} displayed_count_by_area.info
     * @property {Number|undefined} displayed_count_by_area.card_sdk
     * @property {Number|undefined} displayed_count_by_area['leads-dp']
     * @property {Number|undefined} displayed_count_by_area['customers-dp']
     * @property {String} amouser
     * @property {String} amohash
     * @property {String} domain
     * @property {String} subdomain
     * @property {String} server
     */

    /**
     * @typedef {Object} AccountInfo
     * @property {Number} id
     * @property {String} name
     * @property {String} subdomain
     * @property {String} currency
     * @property {Number} paid_from
     * @property {Number} paid_till
     * @property {String} timezone
     * @property {String} date_pattern
     * @property {String} language
     * @property {String} date_format
     * @property {String} time_format
     * @property {String} country
     * @property {String} unsorted_on - Is unsorted turned on ("Y" or "N")
     * @property {Array.<{id:number,is_admin:string,login:string,name:string}>} users
     * @property {{path:string,widget_active:string,widget_code:string}} widget
     */

    /**
     * @typedef {Object} SelectedResult
     * @property {Array.<{id:number,emails:Array.<string>,phones:Array.<string>}>} selected
     * @property {Object} summary
     * @property {Number} summary.items
     * @property {Number} summary.emails
     * @property {Number} summary.phones
     */

    /**
     * @class Widget
     */
    /**
     * @member {String} ns - jQueryEvents namespace 4 widget
     * @memberOf Widget
     */
    /**
     * @member {String} init_once - param from manifest
     * @memberOf Widget
     */
    /**
     * @member {function} crm_post - Post query to external server
     * @memberOf Widget
     * @param {String} host
     * @param {Object} [data={}]
     * @param {function} callback
     * @param {String} [type='text']
     */
    /**
     * @member {function} i18n - Get translation from i18n files
     * @memberOf Widget
     * @param {String} str_code
     * @return {String|boolean} - return false, when lang not found
     */
    /**
     * @member {function} get_settings - Get current widget settings
     * @memberOf Widget
     * @return {Object}
     */
    /**
     * @member {function} system
     * @memberOf Widget
     * @return {WidgetSystemObject}
     */
    /**
     * @member {function} add_action - add callback on system action
     * @memberOf Widget
     * @param {String} type - Type of action (phone or email)
     * @param {function} action - What to do on action
     */
    /**
     * @member {function} get_accounts_current
     * @memberOf Widget
     * @return {AccountInfo}
     */
    /**
     * @member {function} list_selected
     * @memberOf Widget
     * @return {SelectedResult|boolean} - return {SelectedResult} when current area is list
     */
    /**
     * @member {function} render
     * @memberOf Widget
     * @param {Object} data
     * @param {Object} params
     * @return {Boolean|String}
     */
    /**
     * @member {function} render_template
     * @memberOf Widget
     * @param {Object} params
     * @param {Object} [params.caption]
     * @param {String} params.body
     * @param {String} params.render
     * @param {Object} additional_params
     * @return {Boolean|String}
     */
    /**
     * @member {function} widgetsOverlay - Show overlay
     * @memberOf Widget
     */
    /**
     * @member {Object} helpers
     * @member {Modal} helpers.Modal - Modal class for create Modal
     * @memberOf Widget
     */

    /**
     * @class SampleWidgetController
     * @extends Widget
     */
    return function () {
      bootstrap(this);

      /**
       * @type {String}
       */
      this.version = manifest.widget.version;

      /**
       * @type {String}
       */
      this.code = manifest.widget.code;

      this._settings = null;
      this._views = [];

      this._logger = Container.get('logger');

      this.callbacks = {
        /**
         * @description Work with settings. Let's create view for settings modal.
         */
        settings: _.bind(
          /**
           * @param {JQuery} $modal_body
           * @this SampleWidgetController
           */
          function ($modal_body) {
            this._logger.debug('callbacks.settings start');
            //noinspection JSValidateTypes
            this._settings = Container.getSettings($modal_body);

            this._views.push(this._settings);
            this._logger.debug('callbacks.settings finish');
          },
          this
        ),

        /**
         * @param {Object} params
         * @param {Object} params.fields
         * @param {String} params.active - Is widget will be active ('Y' || 'N')
         * Use it only when widget is already installed
         */
        onSave: _.bind(function (params) {
          this._logger.debug('callbacks.onSave start');
          var result = false;
          if (this._settings !== null) {
            result = this._settings.canSave(params.active === 'Y', params.fields);
          }

          this._logger.debug('callbacks.onSave finish');
          return result;
        }, this),


        render: _.bind(function () {
          this._logger.debug('callbacks.render start');
          var template, params, area;
          area = this.system().area;

          if (!area) {
            return false;
          }

          switch (area) {
            case 'lcard':
            case 'comcard':
              template = '<div class="js-widget-{{ widget_code }}-body"></div>';
              params = {widget_code: this.get_settings().widget_code};
              this.render_template({render: template, body: ''}, params);
              break;
          }

          this._logger.debug('callbacks.render finish');
          return true;
        }, this),

        init: _.bind(function () {
          this._logger.debug('callbacks.init start');
          var area = this.system().area;
          var element_type;
          var view = null;

          if (!area) {
            return false;
          }

          switch (area) {
            case 'lcard':
            case 'comcard':
              element_type = area === 'lcard' ? 'leads' : 'companies';
              view = Container.getCardView(element_type);
              break;
          }

          if (view !== null) {
            this._views.push(view);
          }

          this._logger.debug('callbacks.init finish');
          return true;
        }, this),


        bind_actions: _.bind(function () {
          this._logger.debug('callbacks.bind_actions start');
          this._logger.debug('callbacks.bind_actions finish');
          return true;
        }, this),

        dpSettings: _.bind(function () {
          this._logger.debug('callbacks.dpSettings start');
          this._logger.debug('callbacks.dpSettings finish');
        }, this),

        destroy: _.bind(function () {
          this._logger.debug('callbacks.destroy start');
          var view;
          while (this._views.length) {
            view = this._views.shift();
            if (view && _.isFunction(view.remove)) {
              view.remove();
            }

            if (view instanceof Settings) {
              this._settings = null;
            }
          }
          this._logger.debug('callbacks.destroy finish');
        }, this),

        contacts: {
          selected: _.bind(function () {
            this._logger.debug('callbacks.contacts.selected start');
            this._logger.debug('callbacks.contacts.selected finish');
          }, this)
        },

        leads: {
          selected: _.bind(function () {
            this._logger.debug('callbacks.leads.selected start');
            // Disable overlay in list
            this.widgetsOverlay(false);
            //noinspection JSValidateTypes
            var view = Container.getLeadsList(_(this.list_selected().selected).collect('id'));
            this._views.push(view);
            this._logger.debug('callbacks.leads.selected finish');
          }, this)
        }
      };

      return this;
    };
  }
);
