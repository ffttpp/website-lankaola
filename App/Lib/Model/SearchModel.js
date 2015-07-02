/**
 * 产品搜索
 *
 * @type {*}
 */
module.exports = Model(function () {
    return {
        /**
         * 模糊检索品牌名称
         *
         * @param queryString       关键字
         */
        searchByBrandName : function(queryString){
            var sql = [
                "select brand_id from goods_brand where brand_name like '%",
                queryString,
                "%'"
            ].join('');
            return this
                .query(sql, []);
        },
        /**
         * 模糊检索分类名称
         *
         * @param queryString        关键字
         */
        searchByCatName : function(queryString){

            var sql = [
                "select cat_id,parent_id,fid from goods_category where cat_name like '%",
                queryString,
                "%'"
            ].join('');

            return this
                .query(sql, []);
        },
        /**
         * 获取第三极分类id
         *
         * @param key
         * @param value
         */
        selectOverCat : function(key, value){
            var inWhere = key === 0 ? {fid: ['in',value]}: {parent_id: ['in',value]};
            return D('goods_category')
                .field('cat_id')
                .where(inWhere)
                .select();
        },
        /**
         * 获取sku  商品
         *
         * @param data            检索条件
         * @param order           升序降序
         * @param sort            排序字段
         * @param page            当前页
         */
        selectGoodsBySku : function(data, order, sort, page){
            var _self = this;
            var where = {
                "goods.is_delete":0,
                "goods_sku.is_on_sale":1,
                "goods_sku.status":1
            };
            where = data.type == 0
                ? _.extend(where, {"goods.cat_id": ['in',data.value]})
                :(data.type == 1 ? _.extend(where,{"goods.brand_id": ['in',data.value]})
                : _.extend(where, {"goods.goods_name": ['like',['%',data.value,'%'].join('')]}));

            var orderBy = new Array();

            sort == 0 ? orderBy.push('goods_sku.sort') : orderBy.push('goods_sku.price') ;
            orderBy.push(' ');
            order == 0 ? orderBy.push('asc') : orderBy.push('desc') ;
            //console.log(data,where ,orderBy.join(''));
            return D('goods')
                .field('goods.goods_name,goods_brand.brand_name,goods_sku.sku_id,goods_sku.price')
                .join('goods_sku on goods.goods_id = goods_sku.goods_id')
                .join('goods_brand on goods_brand.brand_id = goods.brand_id')
                .where(where)
                .order(orderBy.join(''))
                .page(page, goodsListRows)
                .countSelect();
        },
        /**
         * 获得sku相册
         *
         *
         */
        selectSkuImageBySkuId : function(skuIdArr){
            return D('sku_category')
                .field('sku_category.sku_id,goods_images.img_220')
                .join('goods_images on sku_category.img_id=goods_images.img_id')
                .where({
                    "sku_category.sku_id" : ['in',skuIdArr]
                })
                .group('sku_category.sku_id')
                .select();
        },
        /**
         * sku属性
         * @param skuArr
         * @returns {*}
         */
        skuAttr: function (skuArr) {
            return D('goods_sku_attr')
                .field('goods_sku_attr.sku_id,GROUP_CONCAT(sku_attr_options.options_name SEPARATOR " ") skuAttrName')
                .join('sku_attr_options ON goods_sku_attr.op_id = sku_attr_options.op_id')
                .join('sku_attr ON sku_attr_options.attr_id = sku_attr.attr_id')
                .where({'goods_sku_attr.sku_id': ['IN', skuArr]})
                .group('goods_sku_attr.sku_id')
                .select();
        }
    }
})