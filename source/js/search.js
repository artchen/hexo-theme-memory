/**
 * A super class of common logics for all search services
 * @param options : (object)
 */
var SearchService = function(options) {
  var self = this;
  
  self.config = $.extend({
    per_page: 10,
    form: ".searchform",
    input: ".searchform .search_input",
    modal: "#modal-search",
    modalBody: "#modal-search .modal-body",
    modalFooter: "#modal-search .modal-footer",
    overlay: "#modal-search .overlay",
    resultContainer: "#modal-search .results",
    metadata: "#modal-search .meta",
    ajaxContent: "#modal-search .ajax-content, #modal-search .loading",
    loadingBar: "#modal-search .loading .bar",
    errorContainer: "#modal-search .modal-footer .error",
    closeButton: "#modal-search .close",
    nextButton: "#modal-search .next",
    prevButton: "#modal-search .prev"
  }, options);
  
  self.dom = {
    searchForm: $(self.config.form),
    searchInput: $(self.config.input),
    modal: $(self.config.modal),
    modalBody: $(self.config.modalBody),
    modalFooter: $(self.config.modalFooter),
    overlay: $(self.config.overlay),
    resultContainer: $(self.config.resultContainer),
    closeButton: $(self.config.closeButton),
    prevButton: $(self.config.prevButton),
    nextButton: $(self.config.nextButton),
    metadata: $(self.config.metadata),
    ajaxContent: $(self.config.ajaxContent),
    errorContainer: $(self.config.errorContainer),
    loadingBar: $(self.config.loadingBar)
  };
  
  self.open = false;
  self.percentLoaded = 0;
  self.queryText = "";
  self.nav = {
    next: -1,
    prev: -1,
    total: 0,
    current: 1
  };
  
  self.nextPage = function() {
    if (self.nav.next !== -1) {
      self.query(self.queryText, self.nav.next);
    }
  };
  
  self.prevPage = function() {
    if (self.nav.prev !== -1) {
      self.query(self.queryText, self.nav.prev);
    }
  };
  
  /**
   * Generate html for one result
   * @param url : (string) url
   * @param title : (string) title
   * @param digest : (string) digest
   */
  self.buildResult = function(url, title, digest) {
    var html = "";
    html = "<li>";
    html +=   "<a class='result' href='" +url+ "'>";
    html +=     "<span class='title'>" +title+ "</span>";
    html +=     "<span class='digest'>" +digest+ "</span>";
    html +=     "<span class='icon icon-chevron-thin-right'></span>";
    html +=   "</a>";
    html += "</li>";
    return html;
  };
  
  /**
   * Close the modal, resume body scrolling
   * no param
   */
  self.close = function() {
    self.open = false;
    self.dom.modal.fadeOut();
    $('body').removeClass('modal-active');
  };
  
  /**
   * Searchform submit event handler
   * @param queryText : (string) the query text
   */
  self.onSubmit = function(event) {
    event.preventDefault();
    self.queryText = $(this).children('.search_input').val();
    
    // UI update
    if (!self.open) {
      self.dom.modal.fadeIn();
      $('body').addClass('modal-active');
    }
    self.dom.searchInput.each(function(index,elem) {
      $(elem).val(self.queryText);
    });
    document.activeElement.blur();
    
    // Ajax GET
    if (self.query instanceof Function) {
      self.query(self.queryText, 1);
    }
  };
  
  /**
   * Start loading bar animation
   * no param
   */
  self.startLoading = function() {
    self.dom.loadingBar.show();
    self.loadingTimer = setInterval(function() { 
      self.percentLoaded = Math.min(self.percentLoaded+5,95);
      self.dom.loadingBar.css('width', self.percentLoaded+'%');
    }, 100);
  };
  
  /**
   * Stop loading bar animation
   * no param
   */
  self.stopLoading = function() {
    clearInterval(self.loadingTimer);
    self.dom.loadingBar.css('width', '100%');
    self.dom.loadingBar.fadeOut();
    setTimeout(function() {
      self.percentLoaded = 0;
      self.dom.loadingBar.css('width', '0%');
    }, 300);
  };
  
  /**
   * UI change before sending query
   * no param
   */
  self.uiBeforeQuery = function() {
    self.dom.errorContainer.hide();
    self.dom.ajaxContent.removeClass('loaded');
    self.startLoading();
  };
  
  /**
   * UI change after sending query
   * no param
   */
  self.uiAfterQuery = function() {
    self.dom.modalBody.scrollTop(0);
    self.dom.ajaxContent.addClass('loaded');
    self.stopLoading();
  };
  
  /**
   * Query error handler
   * @param queryText: (string)
   * @param status: (string)
   */
  self.onQueryError = function(queryText, status) {
    var errMsg = "";
    if (status === "success") errMsg = "No result found for \"" +queryText+ "\".";
    else if (status === "timeout") errMsg = "Unfortunate timeout.";
    else errMsg = "Mysterious failure.";
    self.dom.resultContainer.html("");
    self.dom.errorContainer.html(errMsg);
    self.dom.errorContainer.show();
  };
  
  /**
   * Register event handlers
   * no param
   */
  self.init = function() {
    self.dom.searchForm.each(function(index,elem) {
      $(elem).on('submit', self.onSubmit);
    });
    self.dom.overlay.on('click', self.close);
    self.dom.nextButton.on('click', self.nextPage);
    self.dom.prevButton.on('click', self.prevPage);
    self.dom.closeButton.on('click', self.close);
  };
};

/**
 * Search by Google Custom Search Engine JSON API
 * @param options : (object)
 */
var GoogleCustomSearch = function(options) {
  SearchService.apply(this, arguments);
  var self = this;
  var endpoint = "https://www.googleapis.com/customsearch/v1";
  
  /**
   * Generate result list html
   * @param data : (array) result items
   */
  self.buildResultList = function(data) {
    var html = "";
    $.each(data, function(index, row) {
      var url = row.link;
      var title = row.title;
      var digest = (row.htmlSnippet || "").replace('<br>','');
      html += self.buildResult(url, title, digest);
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
      self.dom.metadata.children('.total').html(self.nav.total);
      self.dom.metadata.children('.range').html(self.nav.current + "-" + (self.nav.current+self.nav.currentCount-1));
      self.dom.metadata.show();
    }
    else {
      self.dom.metadata.hide();
    }
    if (data.queries && data.queries.nextPage) {
      self.nav.next = data.queries.nextPage[0].startIndex;
      self.dom.nextButton.show();
    }
    else {
      self.nav.next = -1;
      self.dom.nextButton.hide();
    }
    if (data.queries && data.queries.previousPage) {
      self.nav.prev = data.queries.previousPage[0].startIndex;
      self.dom.prevButton.show();
    }
    else {
      self.nav.prev = -1;
      self.dom.prevButton.hide();
    }
  };
  
  /**
   * Send a GET request
   * @param queryText : (string) the query text
   * @param startIndex : (int) the index of first item (start from 1)
   * @param callback : (function)
   */
  self.query = function(queryText, startIndex, callback) {
    self.uiBeforeQuery();
    $.get(endpoint, {
      key: self.config.apiKey,
      cx: self.config.engineId,
      q: queryText,
      start: startIndex,
      num: self.config.per_page
    }, function(data, status) {
      if (status === 'success' && data.items && data.items.length > 0) {
        var results = self.buildResultList(data.items); 
        self.dom.resultContainer.html(results);       
      }
      else {
        self.onQueryError(queryText, status);
      }
      self.buildMetadata(data);
      self.uiAfterQuery();
      if (callback) {
        callback(data);
      }
    });
  };
  
  self.init();
};

/**
 * Search by Hexo generator json content
 * @param options : (object)
 */
var HexoSearch = function(options) {
  SearchService.apply(this, arguments);
  var self = this;
  var endpoint = "/content.json";
  self.cache = "";
  
  /**
   * Search queryText in title and content of a post
   * Credit to: http://hahack.com/codes/local-search-engine-for-hexo/
   * @param post : the post object
   * @param queryText : the search query
   */
  self.contentSearch = function(post, queryText) {
    var post_title = post.title.trim().toLowerCase(),
        post_content = post.text.trim().toLowerCase(),
        keywords = queryText.trim().toLowerCase().split(" "),
        foundMatch = false,
        index_title = -1,
        index_content = -1,
        first_occur = -1;
    if (post_title !== '' && post_content !== '') {
      $.each(keywords, function(index, word) {
        index_title = post_title.indexOf(word);
        index_content = post_content.indexOf(word);
        if (index_title < 0 && index_content < 0) {
          foundMatch = false;
        }
        else {
          foundMatch = true;
          if (index_content < 0) {
            index_content = 0;
          }
          if (index == 0) {
            first_occur = index_content;
          }
        }
        if (foundMatch) {
          post_content = post.text.trim();
          if (first_occur >= 0) {
            var start = Math.max(first_occur-30, 0);
            var end = (start === 0) ? Math.min(200, post_content.length) : Math.min(first_occur+170, post_content.length);
            var match_content = post_content.substring(start, end);
            keywords.forEach(function(keyword) {
              var regS = new RegExp(keyword, "gi");
              match_content = match_content.replace(regS, "<b>"+keyword+"</b>");
            });
            post.digest = match_content;
          }
          else {
            var end = Math.min(200, post_content.length);
            post.digest = post_content.trim().substring(0, end);
          }
        }
      });
    }
    return foundMatch;
  };
  
  /**
   * Generate result list html
   * @param data : (array) result items
   */
  self.buildResultList = function(data, queryText) {
    var results = [],
        html = "";
    $.each(data, function(index, post) {
      if (self.contentSearch(post, queryText))
        html += self.buildResult(post.permalink, post.title, post.digest);
    });
    return html;
  };
  
  /**
   * Generate metadata after a successful query
   * @param data : (object) the raw google custom search response data
   */
  self.buildMetadata = function(data) {
    self.dom.modalFooter.hide();
  };
  
  /**
   * Send a GET request
   * @param queryText : (string) the query text
   * @param startIndex : (int) the index of first item (start from 1)
   * @param callback : (function)
   */
  self.query = function(queryText, startIndex, callback) {
    self.uiBeforeQuery();
    if (!self.cache) {
      $.get(endpoint, {
        key: self.config.apiKey,
        cx: self.config.engineId,
        q: queryText,
        start: startIndex,
        num: self.config.per_page
      }, function(data, status) {
        if (status !== 'success' || 
            !data || 
            (!data.posts && !data.pages) || 
            (data.posts.length < 1 && data.pages.length < 1)
          ) {
          self.onQueryError(queryText, status);
        }
        else {
          self.cache = data;
          var results = ""; 
          results += self.buildResultList(data.pages, queryText);
          results += self.buildResultList(data.posts, queryText);
          self.dom.resultContainer.html(results);
        }
        self.buildMetadata(data);
        self.uiAfterQuery();
        if (callback) {
          callback(data);
        }
      });
    }
    else {
      var results = ""; 
      results += self.buildResultList(self.cache.pages, queryText);
      results += self.buildResultList(self.cache.posts, queryText);
      self.dom.resultContainer.html(results);
      self.buildMetadata(self.cache);
      self.uiAfterQuery();
      if (callback) {
        callback(self.cache);
      }
    }
  };
  
  self.init();
};

/**
 * Search by Algolia Search
 * @param options : (object)
 */
var AlgoliaSearch = function(options) {
  SearchService.apply(this, arguments);
  var self = this;
  var endpoint = "https://" +options.appId+ ".algolia.net/1/indexes/" +options.indexName;
  
  /**
   * Generate result list html
   * @param data : (array) result items
   */
  self.buildResultList = function(data) {
    var html = "";
    $.each(data, function(index, row) {
      var url = row.permalink || row.path || "";
      if (!row.permalink && row.path) {
        url = "/" + url;
      }
      var title = row.title;
      var digest = row._highlightResult.excerptStrip.value || "";
      html += self.buildResult(url, title, digest);
    });
    return html;
  };
  
  /**
   * Generate metadata after a successful query
   * @param data : (object) the raw google custom search response data
   */
  self.buildMetadata = function(data) {
    self.nav.current = data.page * data.hitsPerPage + 1;
    self.nav.currentCount = data.hits.length;
    self.nav.total = parseInt(data.nbHits);
    self.dom.metadata.children('.total').html(self.nav.total);
    self.dom.metadata.children('.range').html(self.nav.current + "-" + (self.nav.current+self.nav.currentCount-1));
    if (self.nav.total > 0) {
      self.dom.metadata.show();
    }
    else {
      self.dom.metadata.hide();
    }

    if (data.page < data.nbPages-1) {
      self.nav.next = (data.page+1)+1;
      self.dom.nextButton.show();
    }
    else {
      self.nav.next = -1;
      self.dom.nextButton.hide();
    }
    if (data.page > 0) {
      self.nav.prev = (data.page+1)-1;
      self.dom.prevButton.show();
    }
    else {
      self.nav.prev = -1;
      self.dom.prevButton.hide();
    }
  };
  
  /**
   * Send a GET request
   * @param queryText : (string) the query text
   * @param page : (int) the current page (start from 1)
   * @param callback : (function)
   */
  self.query = function(queryText, page, callback) {
    self.uiBeforeQuery();
    $.get(endpoint, {
      query: queryText,
      page: page-1,
      hitsPerPage: self.config.per_page,
      "x-algolia-application-id": self.config.appId,
      "x-algolia-api-key": self.config.apiKey
    }, function(data, status) {
      if (status === 'success' && data.hits && data.hits.length > 0) {
        var results = self.buildResultList(data.hits); 
        self.dom.resultContainer.html(results);
      }
      else {
        self.onQueryError(queryText, status);
      }
      self.buildMetadata(data);
      self.uiAfterQuery();
      if (callback) {
        callback(data);
      }
    });
  };
  
  self.init();
};

/**
 * TODO
 * Search by Azure Search API
 * @param options : (object)
 */
var AzureSearch = function(options) {
  SearchService.apply(this, arguments);
  var self = this;
  var endpoint = "";
  
  self.buildResultList = function(data) {
    
  };
  
  self.buildMetadata = function(data) {
    
  };
  
  self.query = function(queryText, startIndex, callback) {
    
  };
};

/**
 * TODO
 * Search by Baidu Search API
 * @param options : (object)
 */
var BaiduSearch = function(options) {
  SearchService.apply(this, arguments);
  var self = this;
  var endpoint = "";
  
  self.buildResultList = function(data) {
    
  };
  
  self.buildMetadata = function(data) {
    
  };
  
  self.query = function(queryText, startIndex, callback) {
    
  };
};