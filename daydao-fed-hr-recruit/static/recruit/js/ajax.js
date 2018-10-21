/**
 * 此ajax中做了拦截请求错误的统一提示，以及session过期的统一处理
 * 支持seajs方式引用和直接src引用，依赖于 jquery.js、layer.js，调用方式跟jquery的$.ajax()一样
 * 调用方式一（src方式）：
 * Ajax.ajax({
 *     url:"xx/xx.do"
 *    ,data:JSON.stringify(data)
 *    ,success:function(data){
 *        if(data.result == "true"){
 *            console.log(data);
 *        }
 *    }
 * });
 *
 * 调用方式二(用seajs加载)：
 * var Ajax = require("ajax");
 * 然后就参见方法一...
 */
define(function(require,exports,module){
    require("commonStaticDirectory/plugins/jquery.loading");
    var commonAjax = require("commonStaticDirectory/plugins/ajax.js");

    var Ajax = {
        /**
         * 基础工具---组合URL参数
         * @param params
         * @returns {string}
         */
        getParamsStr: function (params) {
            var paramStr = "";
            if (params) {
                for (var k in params) {
                    if (k && params[k] != null) {
                        var sParaVal = "";
                        if(typeof params[k] == "string" || typeof params[k] == "number"){
                            sParaVal = params[k];
                        }else if(typeof params[k] == "object"){
                            sParaVal = JSON.stringify(params[k]);
                        }
                        paramStr += '&' + k + '=' + sParaVal;
                    }
                }
            }
            if(paramStr){
                paramStr = "?"+paramStr.substring(1);
            }
            return paramStr;
        },
        /**
         * 基于$.ajax方法改写，使用方法与$.ajax一样,如：Ajax.ajax({});
         * */
        ajax:function (options) {
            return commonAjax.ajax(options);
        },
        /**
         * api接口统一管理处
         * */
        ApiTools:function(){
            var t = this;
            return {
                /**
                 * 检测会话是否超时
                 * */
                checkSessionTimeout:function(options){
                    t.ajax({
                        url:gMain.apiBasePath +"route/checkSessionTimeout.do",
                        data:JSON.stringify({}),
                        beforeSend:function(){
                            $("body").loading({zIndex:999});
                        },
                        complete:function(){
                            $("body").loading({state:false}); //关闭遮罩
                        },
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                        }
                    });
                },
                /**
                 * 获取表头
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                getTableColumn:function(options){
                    var _formLayer = layer.load(1, {shade: [0.00001, '#FFFFFF']}); //启动loading遮罩
                    t.ajax({
                        url: gMain.apiBasePath +"route/"+ options.infoSetId +"/getTableColumn.do",
                        data: JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            layer.close(_formLayer);//关闭遮罩
                        }
                    });
                },
                /**
                 * 删除表格数据
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                del:function(options){
                    t.ajax({
                        url: gMain.apiBasePath +"route/"+ options.infoSetId +"/del.do",
                        data: JSON.stringify(options.data),
                        beforeSend:function(){
                            $("body").loading({zIndex:999}); //启动loading遮罩
                        },
                        complete:function(){
                            $("body").loading({state:false}); //关闭遮罩
                        },
                        success: function(data){
                            typeof options.success == "function" && options.success(data);
                        }
                    });
                },
                /**
                 * 获取下拉键值对
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                getKeyValueData:function(options){
                    t.ajax({
                        url: options.url?options.url:(gMain.apiBasePath +"route/getKeyValueData.do"),
                        data: JSON.stringify(options.data),
                        beforeSend:function(){
                            typeof options.beforeSend == "function" && options.beforeSend();
                        },
                        complete:function(){
                            typeof options.complete == "function" && options.complete();
                        },
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                        }
                    });
                },
                /**
                   * 详情模板加载接口
                   * @options.infoSetId
                   * @options.data
                   * @options.success
                   * */
                getEditDataAndColumn:function(options){
                    t.ajax({
                          url: gMain.apiBasePath +"route/"+ options.infoSetId +"/getEditDataAndColumn.do",
                          data: JSON.stringify(options.data),
                         beforeSend:function(){
                             typeof options.beforeSend == "function" && options.beforeSend();
                         },
                         complete:function(){
                             typeof options.complete == "function" && options.complete();
                         },
                          success: function(data){
                              if(data.result == "true"){
                                  typeof options.success == "function" && options.success(data);
                              }
                          }
                    });
                },
                /**
                 * 转入职
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                hire:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resumeLib/hire.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 转回收站
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                toRecycle:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resumeLib/toRecycle.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 加入黑名单
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                blist:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resumeRecycle/blist.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 企业信息
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                getCorpInfo:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"active/getCorpInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 保存企业信息
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                saveCorpInfo:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"active/saveCorpInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 发布招聘活动
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                publishActive:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"active/publishActive.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 结束招聘活动
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                endActive:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"active/endActive.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 复制活动
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                copyActive:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"active/copyActive.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 修改招聘类型的基础数据
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                updateActivityTypeTree:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"activityType/updateActivityTypeTree.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 修改费用类型的基础数据
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                updateCostTypeTree:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"costType/updateCostTypeTree.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*候选人左上角基本信息接口*/
                getResumeBasic:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/getResumeStatistics.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*职位左上角基本信息接口*/
                getPosStatistics:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume_deal_pos/getPosStatistics.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*职位下线接口*/
                posOffline:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume_deal_pos/posOffline.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*看板左上角基本信息接口*/
                getBillboardStatistics:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"billboard/getBillboardStatistics.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*发送看板接口*/
                sendBillboard:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"billboard/sendBillboard.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*看板下载接口*/
                downloadBillboard:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"billboard/downloadBillboard.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*转荐职位信息*/
                getPosList:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/getPosList.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*转荐接口*/
                recommendPos:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/recommendPos.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*获取公司所有员工信息接口*/
                getAllPersonNameData:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"route/getKeyValueData.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*简历处理获取全部模板*/
                getAllEliminateData:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"eliminate/getAll.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*简历处理新增模板*/
                addEliminateData:function(options){
                    $("#resumeDealAddTemplate").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"eliminate/addEliminateTemplate.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDealAddTemplate").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*简历处理更新模板*/
                updateEliminateData:function(options){
                    $("#resumeDealAddTemplate").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"eliminate/updateEliminateTemplate.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDealAddTemplate").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*简历处理删除模板*/
                delEliminateData:function(options){
                    $("#resumeDealAddTemplate").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"eliminate/delEliminateTemplate.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDealAddTemplate").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*人才分类提交*/
                talentClassify:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resumeLib/talentClassify.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*加入黑名单*/
                addBlacklist:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resumeLib/addBlacklist.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*解除黑名单*/
                relieveBlacklist:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resumeLib/relieveBlacklist.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*绑定账号*/
                updateOrAddChannel:function(options){
                    $("#recruit_channel_list").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"channel/updateOrAddChannel.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruit_channel_list").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*获取所有绑定账号*/
                getChannelAccount:function(options){
                    $("#recruit_channel_list").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"channel/getAll.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruit_channel_list").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*删除绑定账号*/
                deleteChannelAccount:function(options){
                    $("#recruit_channel_list").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"channel/deleteChannel.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruit_channel_list").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*新增简历基本信息*/
                addOrInsertResumeBaseInfo:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertResumeBaseInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*获取整个简历信息*/
                getResumeAllInfo:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/getResumeAllInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*保存期望工作*/
                addOrInsertHopeWork:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertHopeWork.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*新增或修改工作经验*/
                addOrInsertWorking:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertWorking.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*删除单条信息*/
                delResumeItems:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/delResumeItems.do",
                        data:options.data,
                        type:options.type,
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*新增或修改教育经历*/
                addOrInsertEducation:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertEducation.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*新增或修改项目经历*/
                addOrInsertProject:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertProject.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*新增或修改技能评价*/
                addOrInsertTechnology:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertTechnology.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*新增或修改培训经历*/
                addOrInsertTrain:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertTrain.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*新增或修改语言能力*/
                addOrInsertLanguage:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertLanguage.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*修改自我评价*/
                addOrInsertSelfDesc:function(options){
                    $(".extBtnAddResume").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/addOrInsertSelfDesc.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $(".extBtnAddResume").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*获取简历基本信息*/
                getResumeBaseInfo:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/getResumeBaseInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*安排面试*/
                interviewArrange:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/interviewArrange.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*录用*/
                sendOffer:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/sendOffer.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*文件上传接口*/
                upload:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"file/upload.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*放弃或淘汰*/
                eliminateResume:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/eliminateResume.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*面试评价*/
                interviewEvaluate:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/interviewEvaluate.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*获取简历操作记录*/
                getResumeRecord:function(options){
                    $("#resumeDeal").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/getResumeRecord.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#resumeDeal").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*移动端首页获取数据*/
                getPersonInterviewsApp:function(options){
                    $("body").mLoading();
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/getPersonInterviews.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").mLoading({state:false});
                        }
                    });
                },
                /*移动端面试评价*/
                interviewEvaluateApp:function(options){
                    $("body").mLoading();
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/interviewEvaluate.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").mLoading({state:false});
                        }
                    });
                },
                /*移动端简历操作记录*/
                getResumeRecordApp:function(options){
                    $("body").mLoading();
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/getResumeRecord.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").mLoading({state:false});
                        }
                    });
                },
                /*移动端获取简历基本信息*/
                getResumeBaseInfoApp:function(options){
                    $("body").mLoading();
                    t.ajax({
                        url:gMain.apiBasePath +"resume/getResumeBaseInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").mLoading({state:false});
                        }
                    });
                },
                /*移动端获取整个简历信息*/
                getResumeAllInfoApp:function(options){
                    $("body").mLoading();
                    t.ajax({
                        url:gMain.apiBasePath +"resume/getResumeAllInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").mLoading({state:false});
                        }
                    });
                },
                /*移动端获取学历码表*/
                getCtDataApp:function(options){
                    $("body").mLoading();
                    t.ajax({
                        url:gMain.apiBasePath +"resume/getCtData.do",
                        data:options.data,
                        type:options.type,
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").mLoading({state:false});
                        }
                    });
                },
                /*移动端转办接口*/
                turnToHoldApp:function(options){
                    $("body").mLoading();
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/turnToHold.do",
                        data:options.data,
                        type:options.type,
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").mLoading({state:false});
                        }
                    });
                },
                /*入职简历基本信息*/
                getResumeBaseInfoEntry:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume/getResumeBaseInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*入职接口*/
                orgPersonBaseInfo:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/orgPersonBaseInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*入职新增或修改工作经历*/
                orgPersonWork:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/orgPersonWork.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*入职新增或修改教育经历*/
                orgPersonEdu:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/orgPersonEdu.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*入职新增或修改语言能力*/
                orgPersonLanguage:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/orgPersonLanguage.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*入职新增或修改专业技术资格*/
                orgPersonExpertise:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/orgPersonExpertise.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*入职新增或修改职业资格*/
                orgPersonLicensing:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/orgPersonLicensing.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*入职新增或修改社会关系*/
                orgPersonRelation:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/orgPersonRelation.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*删除入职模块信息*/
                delOrgPersonItem:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"candidate/delOrgPersonItem.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /*职位详情接口*/
                getActivityPosInfo:function(options){
                    $("#recruitEntry").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"resume_deal_pos/getActivityPosInfo.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("#recruitEntry").loading({state:false}); //关闭遮罩
                        }
                    });
                },
                /**
                 * 获取下载模板的选项
                 * @options.infoSetId
                 * @options.data
                 * @options.success
                 * */
                getImportModelByFuncId:function(options){
                    $("body").loading({zIndex:999})
                    t.ajax({
                        url:gMain.apiBasePath +"route/"+ options.infoSetId +"/getImportModelByFuncId.do",
                        data:JSON.stringify(options.data),
                        success: function(data){
                            if(data.result == "true"){
                                typeof options.success == "function" && options.success(data);
                            }
                            $("body").loading({state:false}); //关闭遮罩//关闭loading遮罩
                        }
                    });
                },
                /**
                 * 最后一个属性分割线---无实际意义----------------------------------------
                 * */
                lastPrototype:undefined
            };
        },
        /**
         * 最后一个属性分割线---无实际意义----------------------------------------
         * */
         lastPrototype:undefined
     };

    module.exports = Ajax;
});
