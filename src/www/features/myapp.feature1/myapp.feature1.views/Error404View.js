const VueView = await include('flair.ui.vue.VueView');
const CommonLayout = await include('myapp.shared.views.CommonLayout');


/**
 * @name Error404View
 * @description Default Error View
 */
$$('ns', '(auto)');
Class('(auto)', VueView, function() {
    this.title = "Not Found";
    this.layout = new CommonLayout();
    this.i18n = {
        titles: "./titles.json",
        strings: "./strings.json"
    };
    this.html = `
    <div class="center">
        <div class="card">
            <p></p>
            <h1>404</h1>
            <h2>{{ i18n('strings', 'notfound', 'Not Found') }}</h2>
            <h4>{{ page }}</h4>
        </div>
    </div>
    `;
    this.style = `
    #SCOPE_ID .center {
        position: absolute;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
      }
      
      #SCOPE_ID .card {
        width: 450px;
        height: 275px;
        background: linear-gradient(#f8f8f8, #fff);
        box-shadow: 0 8px 16px -8px rgba(0,0,0,0.4);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        margin: 1.5rem;
      }
      
      #SCOPE_ID .center-img {
        position: relative;
        top: 25%;
        left: 50%;
        -webkit-transform: translate(-25%, -50%);
        text-align: center;
      }
      
      #SCOPE_ID .card h1 {
        position: relative;
        top: 25%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);  
        text-align: center;
      }
      
      #SCOPE_ID .card h2 {
        position: relative;
        top: 25%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);  
        text-align: center;
        font-size: 2rem;
      }
      
      #SCOPE_ID .card h4 {
        position: relative;
        top: 25%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);  
        text-align: center;
        font-size: 1.2rem;
      }
    `;
    this.data = {
        page: ''
    };

    $$('override');
    this.beforeLoad = async (base, ctx, el) => { // eslint-disable-line no-unused-vars
        this.title = this.i18n.titles.notfound || 'Not Found';
        this.data.page = ctx.$path;
    };
});
