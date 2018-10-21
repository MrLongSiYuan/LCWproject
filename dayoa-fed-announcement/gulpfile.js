/**
 * created by zhangqi
 * gulp配置文件
 * 注意事项：各项目的task的任务名称不要相同，以免冲突执行，如加上项目前缀 pay_jsmin
 * */
/**
 * gulp插件引入
 * */
var gulp = require('gulp'); //gulp工具 cnpm install gulp --save-dev
var minJs = require('gulp-uglify'); //js压缩  cnpm install gulp-uglify --save-dev
var minCss = require("gulp-minify-css"); //css压缩  cnpm install gulp-minify-css --save-dev
var cssver = require('gulp-make-css-url-version'); //css文件引入图片地址加版本号   cnpm install gulp-make-css-url-version --save-dev
var replace = require("gulp-replace"); //文件内容替换插件  cnpm install gulp-replace --save-dev
var imagemin = require('gulp-imagemin'); //图片压缩插件 cnpm install gulp-imagemin --save-dev
var zip = require('gulp-zip');
var clean = require('gulp-clean');
var sonarqubeScanner = require('sonarqube-scanner');

/**
 * ======================================华丽的分割线==========================================
 *   gulp配置  by zhangqi   跟其他项目的区别就是多了个排除 config.js
 * ======================================华丽的分割线==========================================
 * */

var regTask = function (sPrefix) {
    //复制一份完整的未处理的
    gulp.task(sPrefix+'_copyfull', function(){
        gulp.src('./static/oa/'+sPrefix+'/**/*.*').pipe(gulp.dest('./dist/static_src/oa/'+sPrefix));
    });

    //压缩js
    gulp.task(sPrefix+'_jsmin', function () {
        gulp.src([
            './static/oa/'+sPrefix+'/**/*.js'
            ,'!./static/oa/'+sPrefix+'/**/*.min.js'
            ,'!./static/oa/'+sPrefix+'/**/zh-cn.js'
            ,'!./static/oa/'+sPrefix+'/config.js'
        ]).pipe(minJs({
            mangle: {except:['require','exports','module','$','jQuery']},//类型：Boolean/Object 默认：true 是否修改变量名
            compress: true//类型：Boolean 默认：true 是否完全压缩
        }))
            .pipe(gulp.dest('./dist/static/oa/'+sPrefix+'/'));
    });


    //压缩css
    //给css文件里引用url加版本号（根据引用文件的md5生产版本号），像这样：.test{background:url(../images/aa.png?v=DFhhsdfaHVKSHDFHDIHDF)}
    gulp.task(sPrefix+'_cssmin', function () {
        gulp.src([
            './static/oa/'+sPrefix+'/**/*.css'
            ,'!./static/oa/'+sPrefix+'/**/*.min.css'
        ]) // 要压缩的css文件
            .pipe(cssver({useDate:true,format:"yyyyMMddhhmmssS"})) //给css文件里引用文件加版本号（文件MD5）
            .pipe(minCss({
                advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
                compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
                keepBreaks: false //类型：Boolean 默认：false [是否保留换行]
            })) //压缩css
            .pipe(gulp.dest('./dist/static/oa/'+sPrefix));
    });


    //压缩图片文件
    gulp.task(sPrefix+'_imagemin', function () {
        gulp.src('./static/oa/'+sPrefix+'/**/*.{png,jpg,gif,ico}')
            .pipe(imagemin({
                optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
                progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
                interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
                multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
            }))
            .pipe(gulp.dest('./dist/static/oa/'+sPrefix));
    });

    //文件内容题换
    if(sPrefix == "home"){
        //文件内容题换
        gulp.task(sPrefix + "_replace", function () {
            var oDate = new Date();
            var sDate = oDate.getFullYear() +""+ (oDate.getMonth() +1) +""+ oDate.getDate() +""+ oDate.getHours() +""+ oDate.getMinutes() +""+ oDate.getSeconds() +""+ oDate.getMilliseconds();
            gulp.src('./home.jsp')
                .pipe(replace(/_VERSION_/gi, sDate))
                .pipe(gulp.dest('./dist'));
        });
    }else if(sPrefix == "index"){
        //文件内容题换
        gulp.task(sPrefix + "_replace", function () {
            var oDate = new Date();
            var sDate = oDate.getFullYear() +""+ (oDate.getMonth() +1) +""+ oDate.getDate() +""+ oDate.getHours() +""+ oDate.getMinutes() +""+ oDate.getSeconds() +""+ oDate.getMilliseconds();
            gulp.src('./index.jsp')
                .pipe(replace(/_VERSION_/gi, sDate))
                .pipe(gulp.dest('./dist/views/oa_daydao_com/'));
        });
    }else{
        gulp.task(sPrefix+"_replace", function () {
            var oDate = new Date();
            var sDate = oDate.getFullYear() +""+ (oDate.getMonth() +1) +""+ oDate.getDate() +""+ oDate.getHours() +""+ oDate.getMinutes() +""+ oDate.getSeconds() +""+ oDate.getMilliseconds();
            gulp.src('./views/'+sPrefix+'/*.html')
                .pipe(replace(/_VERSION_/gi, sDate))
                .pipe(replace(/vue\.js/gi, "vue.min.js"))
                .pipe(gulp.dest('./dist/views/oa_daydao_com/views/'+sPrefix));
        });
    }

    //拷贝未处理的文件，包括图片文件、已经压缩的js文件、html模板文件，日历组件的语言包文件
    gulp.task(sPrefix+'_copy', function(){
        gulp.src([
            './static/oa/'+sPrefix+'/**/*.html'
            ,'./static/oa/'+sPrefix+'/**/*.min.js'
            ,'./static/oa/'+sPrefix+'/**/*.min.css'
            ,'./static/oa/'+sPrefix+'/**/*.swf'
            ,'./static/oa/'+sPrefix+'/**/zh-cn.js'
            ,'./static/oa/'+sPrefix+'/config.js'
            ,'./static/oa/'+sPrefix+'/**/*.{eot,svg,ttf,woff}'
        ]).pipe(gulp.dest('./dist/static/oa/'+sPrefix));
    });

    //批量执行
    gulp.task(sPrefix+'_build', [
        sPrefix+'_copyfull'
        ,sPrefix+'_jsmin'
        ,sPrefix+'_cssmin'
        ,sPrefix+'_imagemin'
        ,sPrefix+'_replace'
        ,sPrefix+'_copy'
    ]);

};

regTask("announcement");
regTask("announcement_mobile");

//代码质量检测
gulp.task("sonarqube", function(callback){
    sonarqubeScanner({
        serverUrl:"http://sonar.daydao.com",
        options:{
            "sonar.projectName": "dayoa-fed-announcement",
            "sonar.projectBaseDir": "./static/",
            "sonar.sources": ".",
            "sonar.sourceEncoding": "UTF-8",
            "sonar.language": "js",
            "sonar.scm.disabled": "true"

        }
    },callback)
});

//清理文件夹
gulp.task("clean", function(){
    return gulp.src(["./dist", "./zip"])
        .pipe(clean());
});

//批量执行
gulp.task('default_build', [
    'sonarqube'
    ,'announcement_build'
    , 'announcement_mobile_build'
]);

//打zip包
gulp.task('zip', function() {
    return gulp.src('./dist/**/*.*')
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('zip'));
});
