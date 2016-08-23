var GoogleCustomSearch = function(options) {
  var self = this;
  var GOOGLE_CUSTOM_SEARCH_ENDPOINT = "https://www.googleapis.com/customsearch/v1";
  var PER_PAGE = 10; // must be between 1-10
  
  var config = $.extend({
    form: ".searchform",
    input: ".searchform .search_input",
    modal: "#modal-search",
    modalBody: "#modal-search .modal-body",
    overlay: "#modal-search .overlay",
    resultContainer: "#modal-search .results",
    closeButton: "#modal-search .close",
    nextButton: "#modal-search .next",
    prevButton: "#modal-search .prev",
    metadata: "#modal-search .meta",
    ajaxContent: "#modal-search .ajax-content, #modal-search .loading",
    loadingBar: "#modal-search .loading .bar",
    errorContainer: "#modal-search .modal-footer .error"
  }, options);
  
  self.config = config;
  
  self.searchForm = $(config.form);
  self.searchInput = $(config.input);
  self.modal = $(config.modal);
  self.modalBody = $(config.modalBody);
  self.overlay = $(config.overlay);
  self.resultContainer = $(config.resultContainer);
  self.closeButton = $(config.closeButton);
  self.prevButton = $(config.prevButton);
  self.nextButton = $(config.nextButton);
  self.metadata = $(config.metadata);
  self.ajaxContent = $(config.ajaxContent);
  self.errorContainer = $(config.errorContainer);
  self.loadingBar = $(config.loadingBar);
  
  self.open = false;
  self.queryText = "";
  self.nav = {
    next: -1,
    prev: -1,
    total: 0,
    current: 1
  };
  
  /**
   * Fetch next page of results (if exists)
   * no param
   */
  self.nextPage = function() {
    if (self.nav.next !== -1) {
      if (config.onBeforeNextPage instanceof Function) {
        config.onBeforeNextPage.call(self);
      }
      self.query(self.queryText, self.nav.next, function(data) {
        if (config.onAfterNextPage instanceof Function) {
          config.onAfterNextPage.call(self, data);
        }
      });
    }
  };
  
  /**
   * Fetch previous page of results (if exists)
   * no param
   */
  self.prevPage = function() {
    if (self.nav.prev !== -1) {
      if (config.onBeforePrevPage instanceof Function) {
        config.onBeforePrevPage.call(self);
      }
      self.query(self.queryText, self.nav.prev, function(data) {
        if (config.onAfterPrevPage instanceof Function) {
          config.onAfterPrevPage.call(self, data);
        }
      });
    }
  };
  
  /**
   * Generate result list html
   * @param data : (array) result items
   */
  self.buildResults = function(data) {
    var html = "";
    $.each(data, function(index, row) {
      html += "<li>";
      html +=   "<a class='result' href='" +row.link+ "'>";
      html +=     "<span class='title'>" +row.title+ "</span>";
      html +=     "<span class='digest'>" +row.htmlSnippet.replace('<br>','')+ "</span>";
      html +=     "<span class='icon icon-chevron-thin-right'></span>";
      html +=   "</a>";
      html += "</li>";
    });
    return html;
  };
  
  /**
   * Generate metadata after a successful query
   * @param data : (object) the raw google custom search response data
   */
  self.buildMetadata = function(data) {
    if (data.queries && data.queries.request && data.queries.request[0].totalResults !== '0') {
      self.nav.current = data.queries.request[0].startIndex;
      self.nav.currentCount = data.queries.request[0].count;
      self.nav.total = parseInt(data.queries.request[0].totalResults);
      self.metadata.children('.total').html(self.nav.total);
      self.metadata.children('.range').html(self.nav.current + "-" + (self.nav.current+self.nav.currentCount-1));
      self.metadata.show();
    }
    else {
      self.metadata.hide();
    }
    if (data.queries && data.queries.nextPage) {
      self.nav.next = data.queries.nextPage[0].startIndex;
      self.nextButton.show();
    }
    else {
      self.nav.next = -1;
      self.nextButton.hide();
    }
    if (data.queries && data.queries.previousPage) {
      self.nav.prev = data.queries.previousPage[0].startIndex;
      self.prevButton.show();
    }
    else {
      self.nav.prev = -1;
      self.prevButton.hide();
    }
  };
  
  
  /**
   * Send a GET request to Google Custom Search API
   * @param queryText : (string) the query text
   */
  self.query = function(queryText, startIndex, callback) {
    self.errorContainer.hide();
    self.ajaxContent.removeClass('loaded');
    $.get(GOOGLE_CUSTOM_SEARCH_ENDPOINT, {
      key: config.apiKey,
      cx: config.engineId,
      q: queryText,
      start: startIndex,
      num: PER_PAGE
    }, function(data, status) {
      if (status === 'success' && data.items && data.items.length > 0) {
        var results = self.buildResults(data.items); 
        self.resultContainer.html(results);       
      }
      else {
        var errMsg = "";
        if (status === "success") errMsg = "No result found for \"" +queryText+ "\".";
        else if (status === "timeout") errMsg = "Unfortunate timeout.";
        else errMsg = "Mysterious failure.";
        self.resultContainer.html("");
        self.errorContainer.html(errMsg);
        self.errorContainer.show();
      }
      self.buildMetadata(data);
      self.modalBody.scrollTop(0);
      self.ajaxContent.addClass('loaded');
      if (callback) {
        callback(data);
      }
    });
  };
  
  /**
   * Searchform submit event handler
   * @param queryText : (string) the query text
   */
  self.search = function(queryText) {
    // UI update
    if (!self.open) {
      self.modal.fadeIn();
      $('body').addClass('modal-active');
    }
    self.searchInput.each(function(index,elem) {
      $(elem).val(queryText);
    });
    document.activeElement.blur();
    // Ajax GET
    self.query(queryText, 1);
  };
  
  /**
   * Close the modal, resume body scrolling
   * no param
   */
  self.close = function() {
    self.open = false;
    self.modal.fadeOut();
    $('body').removeClass('modal-active');
  };
  
  /**
   * Register event handlers
   * no param
   */
  self.init = function() {
    self.searchForm.each(function(index,elem) {
      $(elem).on('submit', function(event) {
        event.preventDefault();
        self.queryText = $(this).children('.search_input').val();
        self.search(self.queryText);
      });
    });
    self.overlay.on('click', self.close);
    self.nextButton.on('click', self.nextPage);
    self.prevButton.on('click', self.prevPage);
    self.closeButton.on('click', self.close);
  };
  
  self.init();
};