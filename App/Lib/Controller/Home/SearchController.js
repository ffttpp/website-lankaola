/**
 * 搜索模块
 *
 *
 * @type {*}
 */
module.exports = Controller('Home/BaseController', function () {
    return {
        init: function (http) {
            var self = this;
            return self.super('init', http);
        },
        /**
         * 搜索
         */
        indexAction : function(){
            var self = this;
            //搜索关键字
            var queryString = self.get('qs');
            //排序字段 0 默认(sort); 1 价格(sku price)
            var sortField = self.get('s') || 0;
            //升序降序 0 升序(asc);1 降序(desc)
            var sort = self.get('o') || 0;
            //当前页
            var page = self.get('p') || 1;

            self.assign('qs', queryString);
            if(!queryString){//跳转到模板显示无数据
                return self.display();
            }

            //三级分类id，可以直接去查询商品
            var three = new Array();

            //处理参数默认值
            return D('Search')
                .searchByBrandName(queryString)
                .then(function(brandDataInfo){
                    if(_.isEmpty(brandDataInfo)){//如果没有匹配的品牌
                        //获取分类数据,并且获得第三级分类
                        //如果没有匹配的分类id则返回空数据
                         return D('Search')
                            .searchByCatName(queryString)
                            .then(function(catIdList){
                                //模糊查询获得的分类id 列表,分类是1，2，3级分类

                                var first = new Array();//用户去获取第三级分类id用于查询商品
                                var secord = new Array();//用户去获取第三级分类id用于查询商品
                                for(var item in catIdList){
                                    var data = catIdList[item];
                                    var catId = data.cat_id;//分类id
                                    var parentId = data.parent_id; //父id
                                    var fid = data.fid; //三级分类的父id
                                    if(fid === 0 && parentId === 0){//一级分类  fid = cat_id
                                        first.push(catId);
                                    }else if(fid === 0 && parentId > 0){//二级分类  parent_id = cat_id
                                        secord.push(catId);
                                    }else{//三级分类
                                        three.push(catId);
                                    }
                                }

                                var promistAll = [];
                                if(!_.isEmpty(first)){
                                    promistAll.push(D('Search').selectOverCat(0,first));
                                }

                                if(!_.isEmpty(secord)){
                                    promistAll.push(D('Search').selectOverCat(1,secord));
                                }
                                if(!_.isEmpty(promistAll)){
                                    return Promise
                                        .all(promistAll)
                                        .then(function(allCatId){//获取所有三级分类id
                                            //console.log(allCatId);
                                            if(_.isEmpty(allCatId)){
                                                return getPromise({});
                                            }

                                            //将数据整合到三级分类中
                                            for(var item in allCatId){
                                                var data = allCatId[item];
                                                for(var i in data){
                                                    if(_.indexOf(three, data[i].cat_id) == -1) {
                                                        three.push(data[i].cat_id);
                                                    }
                                                }
                                            }
                                            return getPromise({"type":0,"value":three});
                                        });
                                }else{
                                    if(!_.isEmpty(three)){
                                        return getPromise({"type":0,"value":three});
                                    }else{
                                        return getPromise({});
                                    }
                                }

                            });
                    }else{//分析出检索的品牌id，极有可能存在多条id的情况
                        var brand = Array();

                        for(var item in brandDataInfo){
                            brand.push(brandDataInfo[item].brand_id);
                        }

                        return getPromise({"type":1,"value":brand});
                    }
                })
                .then(function(value){
                    //如果value是空怎直接匹配商品名称
                    if(_.isEmpty(value)){
                        value = {"type":2,"value":queryString};
                    }
                    return D('Search')
                        .selectGoodsBySku(value, sort, sortField, page);
                })
                .then(function(skuInfo){

                    if(skuInfo.count == 0){
                       return Promise.reject();
                       //return self.display();
                    }
                    //获得skuid
                    var skuIdArr = new Array();
                    _.each(skuInfo.data, function(element){
                        skuIdArr.push(element.sku_id);
                    });

                    //提取商品相册
                    return D('Search')
                        .selectSkuImageBySkuId(skuIdArr)
                        .then(function(skuImageList){
                            _.each(skuInfo.data, function(sku){
                                _.each(skuImageList, function(skuImage){
                                    if(sku.sku_id === skuImage.sku_id){
                                        _.extend(sku,skuImage);
                                    }
                                })
                            })
                            //提取sku属性
                            return D('Search')
                                .skuAttr(skuIdArr)
                                .then(function(skuAttrArray){
                                    _.each(skuInfo.data, function(sku){
                                        _.each(skuAttrArray, function(skuAttr){
                                            if(sku.sku_id === skuAttr.sku_id){
                                                _.extend(sku,skuAttr);
                                            }
                                        })
                                    })
                                    return getPromise(skuInfo);
                                });
                        });
                })
                .then(function(sku){

                    var pageUrl = ['search?qs=', queryString, '&p=${page}', '&o=',sort,'&s=',sortField].join('');

                    sku.showDesc = true;
                    sku.url = pageUrl;

                    //排序
                    var defaultSort = ['search?qs=', queryString, '&p=',page].join('');
                    var priceSort = ['search?qs=', queryString, '&p=',page,'&o=',(sort == 0 ? 1 : 0),'&s=1'].join('');

                    self.assign('sort', sort);//升序降序 0 升序(asc);1 降序(desc);css priceAsc priceDesc
                    self.assign('order', sortField); //排序字段 0 默认(sort); 1 价格(sku price)

                    self.assign('priceSort', priceSort);
                    self.assign('defaultSort', defaultSort);
                    self.assign('pagerData', sku);
                    self.display();
                })
                .catch(function(reject){//catch
                    self.assign('pagerData', {
                      data:[]
                    });
                    self.display();
                });
        }
    }
})