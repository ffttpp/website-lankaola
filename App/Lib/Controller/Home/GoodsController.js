/**
 * 商品Controller
 * User: chenlingguang
 * Date: 14/11/17
 * Time: 下午5:19
 * To change this template use File | Settings | File Templates.
 */
module.exports = Controller('Home/BaseController', function () {
  return {
    init: function (http) {
      var self = this;
      return self.super('init', http);
    },
    /**
     * 商品列表
     * @returns {*}
     */
    indexAction: function () {
      var self = this;
      var fc = parseInt(self.get('fc')) || 0;
      var sc = parseInt(self.get('sc')) || 0;
      var tc = parseInt(self.get('tc')) || 0;
      return self.differCategory(fc, sc, tc).then(function (fid) {
        self.assign('globalFid', fid);
        switch (parseInt(fid)) {
          //办公用品
          case 1:
            return Promise.resolve();
          //办公家具
          case 77:
            return self.redirect('/furniture');
          //绿植
          case 78:
            return self.redirect('/plant');
          //工商服务服务
          case 79:
            return self.redirect('/service');
          //下午茶
          case 80:
            return Promise.resolve();
          //装修
          case 94:
            return self.redirect('/decoration');
          default :
            return Promise.resolve();
        }
      }).then(function () {
        var data = self.get();
        var page = parseInt(data.page) || 1;
        var sort = data['sort'] || '';
        sort = sort.split('_');
        var sortItem = '';
        var sortKey = 'asc';
        var priceSort = '?sort=price_asc';
        if (sort.length == 2) {
          sortItem = sort[0];
          sortKey = sort[1].toLowerCase();
          if (_.indexOf(['asc', 'desc'], sortKey) < 0) {
            sortKey = 'asc';
          }
          switch (sortItem) {
            default :
              sort = 'sort DESC';
              priceSort = '?sort=price_asc';
              break;
            case 'price':
              sort = ['price', sortKey].join(' ');
              if (sortKey == 'asc') {
                priceSort = '?sort=price_desc';
              } else {
                priceSort = '?sort=price_asc';
              }

              break;
          }
          self.assign({
            sortItem: sortItem,
            priceSortKey: sortKey
          });
        } else {
          sort = 'sort desc';
          priceSort = '?sort=price_asc';
          self.assign({
            sortItem: '',
            priceSortKey: ''
          });
        }
        self.assign({
          defaultSortUrl: [['/list', fc, sc, tc].join('-'), '.html'].join(''),
          priceUrl: [['/list', fc, sc, tc].join('-'), '.html', priceSort].join('')
        });

        if (tc) {
          return self.list(fc, sc, tc, tc, page, goodsListRows, data, sort).then(function (sku) {
            self.assign('pagerData', sku);
            return Promise.resolve();
          }).then(function () {
            return D('goods').getCatFid(tc)
          }).then(function (fcat) {
            if (!isEmpty(fcat)) {
              var fid = fcat.fid;
              return D('goods').getCatName(fid).then(function (cat) {
                if (isEmpty(cat)) {
                  return Promise.reject();
                } else {
                  return D('goods').getCatList(fid).then(function (catList) {
                    if (isEmpty(catList)) {
                      return Promise.reject();
                    } else {
                      return Promise.resolve({
                        breadNav: '<a href="/list-' + cat.cat_id + '-0-0.html">' + cat.cat_name + '</a>',
                        catList: catList,
                        fid: cat.cat_id
                      })
                    }
                  })
                }
              })
            } else {
              return Promise.reject();
            }
          }).then(function (data) {
            var tcName = '';
            var scid = '';
            var scName = '';
            _.each(data.catList, function (cat) {
              if (cat.cat_id == tc) {
                tcName = cat.cat_name;
                scid = cat.parent_id
              }
            });
            _.each(data.catList, function (cat) {
              if (cat.cat_id == scid) {
                scName = cat.cat_name
              }
            });
            data.breadNav = [data.breadNav, '<a href="/list-' + data.fid + '-' + scid + '-0.html">' + scName + '</a>', '<span>' + tcName + '</span>'].join('&gt;');
            //a href="/list-'+data.fid+'-'+scid+'-'+tc+'.html"
            var catList = _.groupBy(data.catList, 'fid');
            var scList = [];
            var tcList = [];
            _.each(catList, function (ele, index) {
              if (index == 0) {
                scList = ele;
              } else {
                tcList = ele;
              }
            });
            _.each(scList, function (sc) {
              sc.cl = [];
              _.each(tcList, function (tc) {
                if (sc.cat_id == tc.parent_id) {
                  sc.cl.push(tc);
                }
              })
            });
            data.catList = scList;
            self.assign({
              htmlTitle: tcName,
              fc: data.fid,
              sc: scid,
              tc: tc,
              data: data
            });
            self.display();
          });
        } else if (sc) {
          return D('goods').getCatBypid(sc).then(function (catList) {
            if (isEmpty(catList)) {
              return Promise.reject();
            }
            var catArr = [-1];
            _.each(catList, function (element) {
              catArr.push(element.cat_id);
            });
            return self.list(fc, sc, tc, catArr, page, goodsListRows, data, sort);
          }).then(function (sku) {
            self.assign('pagerData', sku);
            return Promise.resolve();
          }).then(function () {
            return D('goods').getCatPid(sc);
          }).then(function (fcat) {
            if (!isEmpty(fcat)) {
              var fid = fcat.parent_id;
              return D('goods').getCatName(fid).then(function (cat) {
                if (isEmpty(cat)) {
                  return Promise.reject();
                } else {
                  return D('goods').getCatList(fid).then(function (catList) {
                    if (isEmpty(catList)) {
                      return Promise.reject();
                    } else {
                      return Promise.resolve({
                        breadNav: '<a href="/list-' + cat.cat_id + '-0-0.html">' + cat.cat_name + '</a>',
                        catList: catList,
                        fid: cat.cat_id
                      })
                    }
                  })
                }
              })
            } else {
              return Promise.reject();
            }
          }).then(function (data) {
            var scName = '';
            _.each(data.catList, function (cat) {
              if (cat.cat_id == sc) {
                scName = cat.cat_name;
              }
            });
            data.breadNav = [data.breadNav, '<span>' + scName + '</span>'].join('&gt;');//a href="/list-' + data.fid + '-' + sc + '-0.html"
            var catList = _.groupBy(data.catList, 'fid');
            var scList = [];
            var tcList = [];
            _.each(catList, function (ele, index) {
              if (index == 0) {
                scList = ele;
              } else {
                tcList = ele;
              }
            });
            _.each(scList, function (sc) {
              sc.cl = [];
              _.each(tcList, function (tc) {
                if (sc.cat_id == tc.parent_id) {
                  sc.cl.push(tc);
                }
              })
            });
            data.catList = scList;
            self.assign({
              htmlTitle: scName,
              fc: data.fid,
              sc: 0,
              tc: 0,
              data: data
            });
            self.display();
          });
        } else if (fc) {
          return D('goods').getCatByfid(fc).then(function (fcList) {
            if (isEmpty(fcList)) {
              return Promise.reject();
            }
            var catArr = [-1];
            _.each(fcList, function (element) {
              catArr.push(element.cat_id);
            });
            return self.list(fc, sc, tc, catArr, page, goodsListRows, data, sort);
          }).then(function (sku) {
            self.assign('pagerData', sku);
            return Promise.resolve()
          }).then(function () {
            return D('goods').getCatName(fc).then(function (cat) {
              if (isEmpty(cat)) {
                return Promise.reject();
              } else {
                return D('goods').getCatList(fc).then(function (catList) {
                  if (isEmpty(catList)) {
                    return Promise.reject();
                  } else {
                    return Promise.resolve({
                      breadNav: '<a href="/list-' + cat.cat_id + '-0-0.html">' + cat.cat_name + '</a>',
                      catList: catList,
                      fid: cat.cat_id,
                      fcName: cat.cat_name
                    })
                  }
                })
              }
            })
          }).then(function (data) {
            var catList = _.groupBy(data.catList, 'fid');
            var scList = [];
            var tcList = [];
            _.each(catList, function (ele, index) {
              if (index == 0) {
                scList = ele;
              } else {
                tcList = ele;
              }
            });
            _.each(scList, function (sc) {
              sc.cl = [];
              _.each(tcList, function (tc) {
                if (sc.cat_id == tc.parent_id) {
                  sc.cl.push(tc);
                }
              })
            });
            data.catList = scList;
            //console.log(data);
            self.assign({
              htmlTitle: data.fcName,
              fc: data.fid,
              sc: 0,
              tc: 0,
              data: data
            });
            self.display();
          });
        } else {
          return Promise.reject();
        }
      }).catch(function () {
        self.redirect('/');
      });

    },
    /**
     * 获取一级分类
     * @param fc
     * @param sc
     * @param tc
     * @returns {*}
     */
    differCategory: function (fc, sc, tc) {
      if (tc > 0) {
        return D('goods').getCatFid(tc).then(function (fCat) {
          return Promise.resolve(fCat.fid);
        });
      } else if (sc > 0) {
        return D('goods').getCatPid(sc).then(function (fCat) {
          return Promise.resolve(fCat.parent_id);
        })
      } else if (fc > 0) {
        return Promise.resolve(fc);
      } else {
        return Promise.reject();
      }
    },
    /**
     * 商品列表
     * @param fc           一级分类
     * @param sc           二级分类
     * @param tc           三级分类
     * @param cat_id       实际分类
     * @param page         页码
     * @param data         其他GET参数
     * @param sort         排序
     * @returns {*}        Promise
     */
    list: function (fc, sc, tc, cat_id, page, listRows, data, sort) {
      var self = this;
      return D('goods').goodsList(cat_id).then(function (goodsList) {
        var goodsArr = [-1];
        _.each(goodsList, function (element) {
          goodsArr.push(element.goods_id);
        });
        return D('goods').skuListByGoods(goodsArr, sort, page, listRows).then(function (sku) {
          var skuArr = [-1];
          _.each(sku.data, function (ele) {
            skuArr.push(ele.sku_id);
            _.each(goodsList, function (goods) {
              if (ele.goods_id == goods.goods_id) {
                ele.brand_name = goods.brand_name;
                ele.goods_name = goods.goods_name
              }
            })
          });
          return D('goods').skuAttr(skuArr).then(function (attr) {
            attr = _.groupBy(attr, 'sku_id');
            _.each(sku.data, function (ele) {
              ele.skuName = [];
              if (!isEmpty(attr[ele.sku_id])) {
                _.each(attr[ele.sku_id], function (option) {
                  ele.skuName.push(option.options_name)
                })
              }
              ele.skuName = ele.skuName.join(' ');
            });
            return Promise.resolve(sku);
          }).then(function (sku) {
              return D('goods').skuImg(skuArr).then(function (imgList) {
                imgList = _.groupBy(imgList, 'sku_id');
                _.each(sku.data, function (ele) {
                  if (!isEmpty(imgList[ele.sku_id]) && imgList[ele.sku_id].length > 0) {
                    ele.img_220 = imgList[ele.sku_id][0].img_220;
                  }
                });
                return Promise.resolve(sku);
              })
            })

        });
      }).then(function (sku) {
          var pageUrl = ['list', fc, sc, tc].join('-');
          pageUrl += '.html?page=${page}';
          _.each(data, function (ele, index) {
            if (!_.contains(['fc', 'sc', 'tc', 'page'], index)) {
              pageUrl += '&' + index + '=' + ele;
            }
          });
          sku.url = pageUrl;
          sku.showDesc = true;
          return Promise.resolve(sku);
        }, function (e) {
          //console.log(e);
          return Promise.reject();
        })
    },
    /**
     * 企业服务列表
     */
    serviceAction: function () {
      var self = this;
      self.assign('globalFid', 79);
      self.display();
    },
    /**
     * 企业服务详情
     */
    serviceViewAction: function () {
      var fid = 79;
      var self = this;
      var sku_id = parseInt(self.get('skuid'));
      return self.differGoods(sku_id, fid).then(function () {
        return self.item(sku_id, 1, skuCache);
      }).then(function (data) {
        self.assign(data);
        self.display();
      });
    },
    /**
     * 装修列表
     */
    decorationAction: function () {
      this.assign('globalFid', 94);
      this.display();
    },
    /**
     * 装修详情
     */
    decorationViewAction: function () {
      var self = this;
      var fid = 94;
      var sku_id = parseInt(self.get('skuid'));
      return self.commonView(sku_id, fid).then(function (data) {
        self.assign(data);
        self.display();
      }).catch(function (e) {
        self.redirect('/decoration');
      });
    },
    /**
     * 绿植列表
     */
    plantAction: function () {
      this.assign('globalFid', 78);
      this.display();
    },
    /**
     * 绿植详情
     */
    plantViewAction: function () {
      var self = this;
      var fid = 78;
      var sku_id = parseInt(self.get('skuid'));
      return self.commonView(sku_id, fid).then(function (data) {
        self.assign(data);
        self.display();
      }).catch(function (e) {
        self.redirect('/plant');
      });
    },
    /**
     * 绿植、装修详情页公用方法
     * @param sku_id
     * @param fid
     * @returns {*}
     */
    commonView: function (sku_id, fid) {
      var self = this;
      return self.differGoods(sku_id, fid).then(function (cat) {
        self.assign('cat', cat);
        return D('goods').skuListByCat(cat.cat_id);
      }).then(function (skuList) {
        self.assign('goodsList', skuList);
        return self.item(sku_id, 1, skuCache);
      });
    },
    /**
     * 办公用品列表
     */
    supplyAction: function () {
      var self = this;
      self.assign('globalFid', 1);
      var sid = parseInt(self.get('sid')) || 0;
      if (_.indexOf([2, 3, 4, 5], sid) < 0) sid = 0;
      if (sid === 0) {
        var supplyList = [100353, 100347, 100363, 100321, 100326, 100329, 100186, 100161, 100268, 100300, 100273, 100274, 100288, 100282, 100232, 100227, 100260, 100500, 100027, 100072, 100485, 100484, 100324, 100291];
        var bigSku = [100324, 100291];
        return D('goods').skuListBySku(supplyList).then(function (skuList) {
          var skuArr = [];
          _.each(skuList, function (sku) {
            skuArr.push(sku.sku_id);
          });
          return D('goods').skuImg(skuArr).then(function (imgList) {
            _.each(skuList, function (sku) {
              _.each(imgList, function (img) {
                if (sku.sku_id == img.sku_id && !sku.img && img.sort == 1) {
                  sku.img = img;
                }
              })
            });
            return Promise.resolve(skuList);
          })
        }).then(function (skuList) {
          var bigItem = [];
          var smallItem = [];
          _.each(skuList, function (sku) {
            if (_.indexOf(bigSku, sku.sku_id) >= 0) {
              bigItem.push(sku);
            } else {
              smallItem.push(sku);
            }
          });
          if (self.isAjax()) {
            self.json({
              count: 24,
              total: 1,
              page: 1,
              num: 1,
              bigItem: bigItem,
              smallItem: smallItem
            });
          } else {
            self.assign({
              bigItem: bigItem,
              smallItem: smallItem
            });
            self.display();
          }
        }).catch(function () {
          if (self.isAjax()) {
            self.json({
              code: 0
            })
          } else {
            self.redirect('/');
          }
        });
      } else {
        return D('goods').getCatBypid(sid).then(function (catList) {
          var catArr = [-1];
          _.each(catList, function (element) {
            catArr.push(element.cat_id);
          });
          return self.list(1, sid, 0, catArr, 1, 24, [], 'sort desc');
        }).then(function (skuList) {
          self.json(skuList);
        }).catch(function () {
          self.json({
            code: 0
          })
        });

      }

    },
    /**
     * 办公家具列表
     */
    furnitureAction: function () {
      var self = this;
      self.assign('globalFid', 77);
      self.display();
    },
    /**
     * 办公家具详情
     */
    furnitureViewAction: function () {
      var fid = 77;
      var self = this;
      var sku_id = parseInt(self.get('skuid'));
      return self.differGoods(sku_id, fid).then(function () {
        return self.item(sku_id, 1, skuCache);
      }).then(function (data) {
        self.assign(data);
        self.display();
      }).catch(function () {
        self.redirect('/furniture');
      });
    },
    /**
     * 商品详情
     * @returns {*}
     */
    itemAction: function () {
      var self = this;
      var sku_id = parseInt(self.get('sku_id'));
      if (sku_id > 0) {
        return self.differGoods(sku_id, 1).then(function () {
          return self.item(sku_id, 1, skuCache);
        }).then(function (data) {
          self.assign(data);
          self.display();
        }).catch(function () {
          self.redirect('goods/notfound');
          //self.display('home:goods:notfound');
        });
      } else {
        self.redirect('/');
      }
    },
    /**
     * 区分sku是否与当前展示分类一致
     * @param sku_id
     * @param fid
     * @returns {*}
     */
    differGoods: function (sku_id, fid) {
      var self = this;
      return D('goods').skuCategory(sku_id).then(function (cat) {
        if (isEmpty(cat) || !cat.fid) {
          return Promise.reject();
        } else {
          self.assign('globalFid', cat.fid);
          if (_.indexOf([1, 80], cat.fid) >= 0 && _.indexOf([1, 80], fid) >= 0) {
            return Promise.resolve(cat);
          }
          if (fid == cat.fid) {
            return Promise.resolve(cat);
          } else {
            switch (parseInt(cat.fid)) {
              //办公家具
              case 77:
                return self.redirect('/furniture/view/' + sku_id);
              //绿植
              case 78:
                return self.redirect('/plant/view/' + sku_id);
              //工商服务服务
              case 79:
                return self.redirect('/service/view/' + sku_id);
              //装修
              case 94:
                return self.redirect('/decoration/view/' + sku_id);
              default :
                return self.redirect('/item-' + sku_id + '.html');
            }
          }
        }
      });
    },
    /**
     * 未找到商品
     */
    notfoundAction: function () {
      this.display();
    },
    /**
     * 后台预览
     * @returns {*}
     */
    previewAction: function () {
      var self = this;
      var sku_id = self.get('skuid');
      if (self.referer().indexOf('admin.lankaola.com') > 0 && sku_id){
        return self.item(sku_id, 0, 0).then(function (data) {
          self.assign(data);
          self.display('home:goods:item');
        }).catch(function () {
          self.redirect('goods/notfound');
          //self.display('home:goods:notfound');
        });
      } else {
        self.redirect('/');
      }

    },
    /**
     * 商品详情
     * @param sku_id
     * @param is_on_sale  查看所有或者上架
     * @returns {*}
     */
    item: function (sku_id, is_on_sale, cacheTime) {
      var self = this;
      self.assign('sku_id', sku_id);
      return D('goods').skuItem(sku_id, is_on_sale, cacheTime).then(function (sku) {
        if (isEmpty(sku)) {
          return Promise.reject();
        } else {
          return D('goods').spuAttr(sku.goods_id).then(function (spuAttr) {
            sku.spu = [];
            _.each(spuAttr, function (element) {
              sku.spu.push(element);
            });
            return Promise.resolve(sku);
          })
        }
      }).then(function (sku) {
        return D('goods').skuImg(sku_id).then(function (img) {
          sku.img = img;
          return Promise.resolve(sku);
        })
      }).then(function (sku) {
        return D('goods').skuAttr(sku.sku_id).then(function (skuAttr) {
          sku.sku = [];
          sku.sku_op = [];
          _.each(skuAttr, function (element) {
            sku.sku.push(element);
            sku.sku_op.push(element.op_id);
          });
          return Promise.resolve(sku);
        })
      }).then(function (sku) {
        return D('goods').goodsSku(sku.goods_id).then(function (data) {
          var attribute = [];
          var sku_attr = {};
          _.each(_.values(_.groupBy(data, 'attr_id')), function (attr, index) {
            if (attr.length > 0) {
              var hasAttr = [];
              var dataArr = [];
              _.each(attr, function (op) {
                if (_.indexOf(hasAttr, op.op_id) < 0) {
                  hasAttr.push(op.op_id);
                  dataArr.push(op);
                }
              });
              attribute[index] = {
                attr_id: attr[0].attr_id,
                attr_name: attr[0].attr_name,
                data: dataArr
              }
            }
          });
          _.each(_.groupBy(data, 'sku_id'), function (attr, index) {
            var sku_key = [];
            _.each(attr, function (op) {
              sku_key.push(op.op_id);
            });
            sku_attr[sku_key.join('_')] = index;
          });
          self.assign({
            attribute: attribute,
            sku_attr: JSON.stringify(sku_attr)
          });
          return Promise.resolve(sku);
        }).then(function (sku) {
          var bread = {
            fc: ['/list-' + sku.fc + '-0-0.html', sku.fn],
            sc: ['/list-' + sku.fc + '-' + sku.sc + '-0.html', sku.sn],
            tc: ['/list-' + sku.fc + '-' + sku.sc + '-' + sku.tc + '.html', sku.tn]
          };
          var showPic = true;
          if (sku.fc == 79) {
            showPic = false;
          }
          return Promise.resolve({
            showPic: showPic,
            bread: bread,
            sku: sku
          });
        });
      }).catch(function (e) {
        //console.log(e);
        return Promise.reject();
      })
    },
    testAction: function () {
      this.assign('pagerData', {
        showDesc: true,
        url: '',
        count: 123,
        total: 10,
        num: 20,
        data: []
      });
      this.display();
    }
  }
});