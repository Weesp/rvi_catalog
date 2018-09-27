/**
 * Компонент Vue catalog-details для управления детальной страницы продукции
 * @param {string} uid NomenclatureListPull.ItemTable['#value']['UID'] - uid продукта
 * @param {string} product_name  NomenclatureListPull.ItemTable['#value']['Name'] - название продукта
 * @param {object} product NomenclatureListPull.ItemTable - объект характеристик продукта
 * @param {array} meta NomenclatureListPull.ItemPropertylabel - массив иконок для продукта
 * @param {array} product_property NomenclatureListPull.ItemPropertyManager - массив характеристик для управления свйоствами продукции
 * @param {array} product_property_tex NomenclatureListPull.ItemPropertyTex - массив технических характеристик продукции
 * @return {object} catalogDetails - компонент vue,
*/
const catalogDetails = Vue.component('catalog-details', {
    template: `
    <div class="content">
        <div class="page-breadcrumps">
            <h1 class="page-breadcrumps__title">{{product_name}}</h1>
        </div>
        <div class="page-detail">
            <div class="page-detail__buttons">
                <div 
                    v-for="(label, label_index) in meta"
                    v-if="label.propertyValue.PropertyValueRepresentation"
                    class="btn btn--psevdo page-detail__button"
                    :class="label.dClass"
                    :data-col="label.dClass"
                >
                    <span>{{label.dName}}</span>
                </div>
                <span class="page-detail__circle"><img src="/src/img/svg/iconCalc.svg" width="25" height="25" alt="Калькулятор"></span>
                    <b>Калькулятор расстояния</b>
                </a>
                <div class="page-tabs">
                    <ul class="page-tabs__ul">
                        <li @click="jsTabsController" class="page-tabs__li"><span data-tabs="desc" class="js-tabs page-tabs__link page-tabs__link--active">Описание</span></li>
                        <li @click="jsTabsController" class="page-tabs__li"><span data-tabs="tech" class="js-tabs page-tabs__link page-tabs__link--big">Технические<br>характеристики</span></li>
                        <li @click="jsTabsController" class="page-tabs__li"><span data-tabs="down" class="js-tabs page-tabs__link">Скачать</span></li>
                        <li @click="jsTabsController" class="page-tabs__li"><span data-tabs="acce" class="js-tabs page-tabs__link">Аксессуары</span></li>
                        <li class="page-tabs__li page-tabs__li--absolute page-tabs__li--compare"><a href="#"><span class="icon-circle--add">+</span> <span class="compare-text">Добавить к сравнению</span></a></li>
                    </ul>
                </div>
                <div class="js-block page-detail__desciption hide" data-block="tech">
                    <div v-for="(group_tex, index_tex) in product_property_group" class="page-compare__block">
                        <h5 class="page-compare__title">{{group_tex}}</h5>
                        <div class="page-compare__data">
                            <div
                                v-for="(prop, indx) in product_property_tex"
                                v-if="prop.propertyData.PropertyGroup.Name == group_tex " 
                                class="page-compare__item">
                                {{prop.propertyData.Name}} : {{prop.propertyValue.PropertyValueRepresentation}}
                            </div>
                        </div>
                    </div>
                </div>
                <button class="btn" @click="goBackToItems"><span>Назад</span></button>
            </div>
        </div>
    </div>
    `,
    data() {
        return{
            product_name: this.$route.params["product_name"],
            uid: this.$route.params["uid"],
            item: this.$route.params["product"],
            meta: this.$route.params["meta"],
            product_property: this.$route.params["product_property"],
            product_property_tex: this.$route.params["product_property_tex"],
        }
    },
    methods: {
        /** 
         * Управление состоянием отрисовки объектов при клике кнопки возврата к списку продукции
        */
        goBackToItems() {
            rvi_catalog.show_detail=false;
            rvi_catalog.show_item=true;
            this.$router.push('/catalog_vue2/');
        },
        /**
         * событие переключения вкладок (js-block)
         * @param {object} event событие клика по тегу li.page-tabs__li
         */
        jsTabsController(event) {
            for (let item of document.getElementsByClassName('js-tabs')) {
                if (item.getAttribute('data-tabs') === event.target.closest('.js-tabs').dataset['tabs']) {
                    item.classList.add('page-tabs__link--active');
                } else {
                    item.classList.remove('page-tabs__link--active');
                }
            }
            for (let item of document.getElementsByClassName('js-block')) {
                if (item.getAttribute('data-block') === event.target.closest('.js-tabs').dataset['tabs']) {
                    item.classList.remove('hide');
                } else {
                    if (!item.classList.contains('hide')) {
                        item.classList.add('hide');
                    }
                }
            }
        },
    },
    computed: {
        /**
         * Создание групп характеристик для технических характеристик (Матрица, Объектив и т.д.)
         * @return {array} массив позволяющий отрисовывать группу в нужный момент
        */
        product_property_group() {
            let group = [];
            let property_group_old = '';
            // сортируем по параметру сортировки из 1с
            function compareNumeric(a, b) {
                if (+a.propertyData.Sort > +b.propertyData.Sort) return 1;
                if (+a.propertyData.Sort < +b.propertyData.Sort) return -1;
            }
            this.product_property_tex.sort(compareNumeric);

            //получаем ключи групп свойств
            for(ind_tex in this.product_property_tex){
                console.log(this.product_property_tex[ind_tex]);

                if(this.product_property_tex[ind_tex].propertyData.PropertyGroup.Name != property_group_old){
                    // записываем новое имя в группу, если в выборке поле изменилось. 
                    group.push(this.product_property_tex[ind_tex].propertyData.PropertyGroup.Name);
                }
                property_group_old = this.product_property_tex[ind_tex].propertyData.PropertyGroup.Name;
            }
            return group;
        },
    },
    watch: {
        /**
         * Отслеживание изменений входящих параметров в роутер (не костыль, официальные доки)
         * @param {object} toR данные объекта после изменении
         * @param {object} fromR данные объекта до изменения
         */
        $route (toR, fromR) {
            this.product_name = toR.params['product_name'];
            this.uid = toR.params['uid'];
            this.item = toR.params['product'];
            this.meta = toR.params['meta'];
            this.product_property = toR.params['product_property'];
            this.product_property_tex = toR.params['product_property_tex'];
        },
    },
   
});
/**
 * Config для VueRouter
 */
const router = new VueRouter({
    routes: [
        /*{
            path: '/catalog_vue2', 
            component: rvi_catalog, 
        },*/
        {
            path: '/catalog_vue2/:product_name/',
            component: catalogDetails,
            name: 'detail',
        },
    ],
    mode: "history",
})
Vue.use(VueRouter);
/**
 * Главный объект vue получает/управляет данными из 1С
 * @param {string} msg строка состояний
 * @param {object} catalog_data собирает общие данные из 1С о структуре страницы, навигации и характеристиках
 * @param {object} NomenclatureListPull собирает данные о продукции
 * @param {object} gets данные из get ссылки
 * @param {boolean} show_category флаг состияния анимации для категорий каталога
 * @param {boolean} show_detail флаг состияния анимации для детальной страницы продукции
 * @param {boolean} show_item флаг состияния анимации для списка продукции
 * @param {object} category_rvi инструмент управления вёрсткой страницы категорий
 * @return {object} Vue object
 */
var rvi_catalog = new Vue({
    el: "#filter-zone",
    data: {
        msg: 'Пока что кнопки меню возвращают 0 элементов таблицы номенклатур, поэтому нажмите кнопку',
        catalog_data: {
            RequesitsStructure: '', // структура данных
            PropertyValueTable: '', // все свойства характеристик продукции 
            PropertyTable: '',      // все характеристики продукции
        },
        NomenclatureListPull: {
            ItemTable: [],          // Продукция
            ItemPropertylabel: [],  // метки для продукции
            ItemPropertyManager: [],// характеристики для управления 
            ItemPropertyTex: [],    // технические характеристики для отрисовки
            PropertyValueTable: '', // значения характеристик
            PropertyTable: '',      // описание характеристик
        },
        gets: '',
        show_category: true,
        show_detail: false,
        show_item: false,
        category_rvi:{
            main_section: {
                section_left: [
                    {
                        name: "IP-видеонаблюдение",
                        uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                        child: [
                            {
                                name: "IP-видеорегистраторы (NVR)",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                            {
                                name: "IP-камеры видеонаблюдения",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            }
                        ],
                    },
                    {
                        name: "HD-аналоговое видеонаблюдение",
                        uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                        child: [
                            {
                                name: "HD-видеоргистраторы",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                            {
                                name: "HD-камеры видеонаблюдения",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            }
                        ],
                    },
                    {
                        name: "Сетевое оборудование",
                        uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                        child: [
                            {
                                name: "Сетевые коммутаторы",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                            {
                                name: "PoE-инжектор",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                            {
                                name: "Грозозащита",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                        ],
                    },
                ],
                section_right: [
                    {
                        name: "Дополнительное оборудование и аксессуары",
                        uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                        child: [
                            {
                                name: "Объективы",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                            {
                                name: "Термокожухи",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                            {
                                name: "Мониторы видеонаблюдения",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                        ],
                    },
                ],
            },
            section_second: {
                section_left: [
                    {
                        name: "Снято с производства",
                        uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                        child: [
                            {
                                name: "HD-аналоговое видеонаблюдение",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                            {
                                name: "IP-видеонаблюдение",
                                uid: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx",
                            },
                        ],
                    },
                ],
            },
        }
    },
    router,
    methods: {
        /**
         * axios запрос к скрипту, получающему данные из 1С. Получаем данные при навигации между категориями товаров.
         * @param {string} xml_id uid группы номенклатуры (определённый набор продукции и характеристик в 1С)
         * @return {object} update catalog_data.PropertyTable, catalog_data.PropertyValueTable, catalog_data.RequesitsStructure, show_category, show_item
         */
        get_catalog_data(xml_id) {
            axios({
                method: 'post',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                url: 'get_catalog_data',
                data: {
                    xml_id: xml_id,
                }
            })
            .then(function(response) {
                if(response.data.PropertyTable && response.data.PropertyValueTable && response.data.RequesitsStructure){
                    rvi_catalog.msg = 'Загрузились данные с сервака 1C. Охохо, посмотри как их много!';
                    rvi_catalog.catalog_data.PropertyTable = response.data.PropertyTable;
                    rvi_catalog.catalog_data.PropertyValueTable = response.data.PropertyValueTable;
                    rvi_catalog.catalog_data.RequesitsStructure = response.data.RequesitsStructure;
                    console.log(response.data);
                    rvi_catalog.show_category = false,
                    rvi_catalog.show_item = true,
                    rvi_catalog.filterGoinSOAP(); // сразу запускаем фильтрацию для получения товара из списка
                }else{
                    console.log('Error response! WSDL doesn\'t contain required objects.');
                    console.log(response);
                }                
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        /**
         * axios запрос фильтрации в 1С
         * @param {object} filter_data объект полей фильтра
         * @return {object} update NomenclatureListPull
         */
        filterGoinSOAP(filter_data) {
            if(filter_data){
                this.catalog_data.PropertyValueTable['#value'] = filter_data;
            }
            //console.log(this.catalog_data);
            axios({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: 'filterGoinSOAP',
                data:{
                    filter_json: {
                        '#value': rvi_catalog.catalog_data,
                    },
                }
            })
            .then(function(response) {
                console.log(response.data);
                if(response.data.PropertyTable && response.data.PropertyValueTable && response.data.ItemTable){
                    rvi_catalog.msg = 'Запуск filterGoinSOAP (фильтр пошёл в 1с смотреть что там)';
                    rvi_catalog.NomenclatureListPull.ItemTable = response.data.ItemTable;
                    rvi_catalog.NomenclatureListPull.PropertyValueTable = response.data.PropertyValueTable;
                    rvi_catalog.NomenclatureListPull.PropertyTable = response.data.PropertyTable;
                    rvi_catalog.GetItemProperty(); // сразу запускаем получение свойст для продукции
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        /**
         * Асинхронная функция GetItemProperty для получения массива характеристик продукции из 1С
         * @param {array} NomenclatureListPull.ItemTable - массив продукции
         * Вызывает axios с параметрами data:
         * @param {string} xml_id - 'UID из объекта NomenclatureListPull' см. filterGoinSOAP
         * @return {object} NomenclatureListPull update: ItemPropertyTex, ItemPropertylabel, ItemPropertyManager; дополняем объект Vue с продукцией характеристиками, делим их по группам для отрисовки компонентов
         */
        GetItemProperty() { 
            rvi_catalog.NomenclatureListPull.ItemPropertyTex = [];
            rvi_catalog.NomenclatureListPull.ItemPropertylabel = [];
            rvi_catalog.NomenclatureListPull.ItemPropertyManager = [];
            //прогоняем продукцию возвращённую фильтром
            for(item in rvi_catalog.NomenclatureListPull.ItemTable){
                // вызываем асинхронно
                renderProperty(item).then(
                    response => {
                        //console.log(response);
                        if(response.label){
                            rvi_catalog.NomenclatureListPull.ItemPropertylabel.push(response.label);
                        }
                        if(response.list_product){
                            rvi_catalog.NomenclatureListPull.ItemPropertyManager.push(response.list_product);
                        }
                        if(response.detail_product_property){
                            rvi_catalog.NomenclatureListPull.ItemPropertyTex.push(response.detail_product_property);
                        }
                    },
                    error => console.log(error)
                );
            }
            function renderProperty(item) {
                return new Promise(function(resolve, reject) {
                    axios({
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        url: 'get_item_property',
                        data:{
                            xml_id: rvi_catalog.NomenclatureListPull.ItemTable[item]["#value"]["UID"],
                        }
                    })
                    .then(function(response) {
                        let item_prop = {
                            label:[],
                            list_product: [],
                            detail_product_property: [],
                            count: item,
                        };
                        // создаём карту стикеров для продукции для управления дизайном
                        let label_UID = new Map([
                            ['f042c5d0-ac16-11e8-80c5-48df3707765c',{
                                "dClass":'btn--red',"dName":'969',
                                "iClass":'btn--red',"iName":'969',
                            }], //ФЗ-969
                            ['4c012ade-dcb6-11e3-aaa0-00259018d529',{
                                "dClass":'btn--red',"dName":'969',
                                "iClass":'btn--red',"iName":'969',
                            }], //Снято с производства
                            ['f59dee9b-4fa7-11e4-aaa0-00259018d529',{
                                "dClass":'btn--photoLittle',"dName":'',
                                "iClass":'btn--photoLittle',"iName":'',
                            }], //Выводится из ассортимента 
                            ['57f4b602-dcb6-11e3-aaa0-00259018d529',{
                                "dClass":'',"dName":'НОВИНКА',
                                "iClass":'',"iName":'NEW',
                            }], //новинка,
                        ]);

                        //соединяем таблицу со значениями свойств (ItemPropertyValuesTable) и таблицу с описанием свойств (PropertyTable)
                        let i = j = l = 0;
                        console.log(response.data.ItemPropertyValuesTable);
                        for(propertyTable_index in response.data.ItemPropertyValuesTable){
                            for(property_index in response.data.PropertyTable){
                                //проверяем свойство "для сайта"
                                if(response.data.PropertyTable[property_index]["ForSite"]){
                                    if(response.data.ItemPropertyValuesTable[propertyTable_index]["PropertyUID"] == response.data.PropertyTable[property_index]["UID"]){
                                        if(response.data.PropertyTable[property_index]["PropertyGroup"]){
                                            // маркетинговые свойства
                                            if(response.data.PropertyTable[property_index]["PropertyGroup"]["UID"] == "becc22ea-b270-11e8-80c5-48df3707765c"){
                                                // стикеры
                                                if(label_UID.has(response.data.PropertyTable[property_index]['UID'])){
                                                    item_prop.label[l] = {
                                                        "propertyData" : response.data.PropertyTable[property_index],
                                                        "propertyValue" : response.data.ItemPropertyValuesTable[propertyTable_index],
                                                        "dClass" : label_UID.get(response.data.PropertyTable[property_index]['UID']).dClass,
                                                        "dName" : (label_UID.get(response.data.PropertyTable[property_index]['UID']).dName != "" 
                                                                    ? label_UID.get(response.data.PropertyTable[property_index]['UID']).dName 
                                                                    : response.data.PropertyTable[property_index]["Name"] ),
                                                        "iClass" : label_UID.get(response.data.PropertyTable[property_index]['UID']).iClass,
                                                        "iName" : (label_UID.get(response.data.PropertyTable[property_index]['UID']).iName != "" 
                                                                    ? label_UID.get(response.data.PropertyTable[property_index]['UID']).iName 
                                                                    : response.data.PropertyTable[property_index]["Name"] ),

                                                    }
                                                    l++;
                                                }
                                                //не стикеры =)
                                                if(response.data.ItemPropertyValuesTable[propertyTable_index]){
                                                    item_prop.list_product[i] = {
                                                        "propertyData" : response.data.PropertyTable[property_index],
                                                        "propertyValue" : response.data.ItemPropertyValuesTable[propertyTable_index],
                                                    }
                                                    i++;
                                                }
                                            // технические характеристики
                                            }else{
                                                item_prop.detail_product_property[j] = {
                                                    "propertyData" : response.data.PropertyTable[property_index],
                                                    "propertyValue" : response.data.ItemPropertyValuesTable[propertyTable_index],
                                                }
                                                j++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        //если ответ успешен возвращаем обещание
                        if(response.status == 200){
                            resolve(item_prop);
                        }else{
                            console.log("Сервер вернул статус "+response.status+" см. функцию renderProperty, метода GetItemProperty");
                        }
                    })
                    .catch(function (error) {
                        reject(error);
                        console.log(error);
                    });
                })
            }
        },
        /**
         * работает с PropertyValueTable изменяет весь объект в зависимости от взаимодействия пользователя с фильтром
         * 
         * @param {object} inputs DOM элемента input
         * @param {string} index_prop index изменяемой характеристики
         * @param {string} type тип поля фильтрации
         * 
         * для коректной фильтрации необходимо правильно управлять состояниями активности в объекте 1С
         */
        CheckObject(inputs,index_prop,type) {
            if(type == 'checkbox'){
                for(checkbox in inputs){
                    //console.log(inputs[checkbox]["#value"]["Active"]);
                    if(inputs[checkbox]["#value"]["Active"] === true){
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['Active'] = true;
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['TypeOfComparison'] = "InList";
                        break;
                    }else{
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['Active'] = false;
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['TypeOfComparison'] = "";
                    }
                }
                //console.log(this.filter_property_wsdl[index_prop]['#value']['Active']);
            }
            if(type == "from" || type == "to"){
                if(type == "from"){
                    if(inputs[0]['#value']['ValueS']['#value'] != "" ){
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']["Object1C"]['#value']["ValueListString"]["0"]['#value']['Active'] = true;
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['Active'] = true;
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['TypeOfComparison'] = "Interval";
                    }else if(
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']["Object1C2"]['#value']["ValueListString"]["0"]['#value']['ValueS']['#value'].indexOf('Insert<<') == 0
                        || this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']["Object1C2"]['#value']["ValueListString"]["0"]['#value']['ValueS']['#value'] == ""
                    ){
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['Active'] = false;
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['TypeOfComparison'] = "";
                    }
                }
                if(type == "to"){
                    if(inputs[0]['#value']['ValueS']['#value'] != "" ){
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']["Object1C2"]['#value']["ValueListString"]["0"]['#value']['Active'] = true;
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['Active'] = true;
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['TypeOfComparison'] = "Interval";
                    }else if(
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']["Object1C"]['#value']["ValueListString"]["0"]['#value']['ValueS']['#value'].indexOf('Insert<<') == 0
                        || this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']["Object1C"]['#value']["ValueListString"]["0"]['#value']['ValueS']['#value'] == ""
                    ){
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['Active'] = false;
                        this.catalog_data.PropertyValueTable["#value"][index_prop]['#value']['TypeOfComparison'] = "";
                    }
                }
                //console.log(this.filter_property_wsdl[index_prop]['#value']['Active']);
                // console.log(this.filter_property_wsdl[index_prop]);
            }
            
        },
        /**
         * Событие кнопки фильтрации
         */
        filterSubmit(){
            this.filterGoinSOAP(this.catalog_data.PropertyValueTable["#value"]);
        },
        /**
         * Отвечает за вёрстку акардеона фильтрации параметров
         * @param {object} event клик по парамтерам фильтрации
         */
        toggleActiveFilter(event){
            //не понял как сюда передать DOM Элемента на котором висит событие, поэтому танцую от target
            event.target.closest('.page-list__listItem').getElementsByClassName('page-filter__title')[0].classList.toggle('minifid');
            event.target.closest('.page-list__listItem').getElementsByClassName('page-filter__block')[0].classList.toggle('minifid');
        },
    },
    computed: {
        /**
         * Дополняет объект значений характеристиками, параметрами из глобального объекта характеристик для вёрстки.
         */
        PropertyAttrData(){
            var PropertyAttr = [];
            for(PropertyKey in this.catalog_data.PropertyValueTable["#value"]){
                for(Property in this.catalog_data.PropertyTable){
                    if(this.catalog_data.PropertyValueTable["#value"][PropertyKey]['#value']['PropertyUID'] === this.catalog_data.PropertyTable[Property]['UID']){
                        PropertyAttr[PropertyKey] = {
                            '#value':{
                                PropertyAttr: this.catalog_data.PropertyTable[Property]
                            }
                        }
                        //this.filter_property_wsdl[PropertyKey]['#value']['PropertyAttr'] = this.filter_property_table[Property];
                    }
                }
            }
            //console.log('computed PropertyAttr');
            return PropertyAttr;
        },
    }
});

/** смотрим get из адресной строки */
rvi_catalog.gets = (function() {
    var a = window.location.search;
    var b = new Object();
    a = a.substring(1).split("&");
    for (var i = 0; i < a.length; i++) {
  	c = a[i].split("=");
        b[c[0]] = c[1];
    }
    return b;
})();

window.onload = function() {
    let loc = window.location.hash.replace("#","");
    rvi_catalog.get_catalog_data(loc);
};
