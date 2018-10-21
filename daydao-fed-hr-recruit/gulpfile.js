/**
 * created by zhangqi
 * gulp配置文件
 * 注意事项：各项目的task的任务名称不要相同，以免冲突执行，如加上项目前缀 recruit_jsmin
 * */

/**
 * gulp插件引入
 * */
var gulp = require('gulp');  //cnpm install gulp --save-dev
var minJs = require('gulp-uglify'); //cnpm install gulp-uglify --save-dev
var minCss = require("gulp-minify-css"); //cnpm install gulp-minify-css --save-dev
var cssver = require('gulp-make-css-url-version');  //cnpm install gulp-make-css-url-version --save-dev
var replace = require("gulp-replace");  //cnpm install gulp-replace --save-dev
var imagemin = require('gulp-imagemin'); //图片压缩插件 cnpm install gulp-imagemin --save-dev
var zip = require('gulp-zip'); //打zip包
var clean = require('gulp-clean'); //清理文件夹
var sonarqubeScanner = require('sonarqube-scanner');

/**
 * ======================================华丽的分割线==========================================
 *   招聘项目的配置
 * ======================================华丽的分割线==========================================
 * */
//复制一份完整的未处理的
gulp.task('recruit_copyfull', function(){
    gulp.src('static/recruit/**/*.*').pipe(gulp.dest('dist/static_src/hr/recruit'));
});

//压缩js
gulp.task('recruit_jsmin', function () {
    gulp.src(['static/recruit/js/**/*.js','!static/recruit/js/**/*.min.js','!static/recruit/js/**/zh-cn.js'])
        .pipe(minJs({
        	mangle: {except:['require','exports','module','$','jQuery']},//类型：Boolean/Object 默认：true 是否修改变量名
            compress: {
                drop_console: true, //去掉console日志
                drop_debugger:true //去掉debugger调试标记
            }
            //,preserveComments: "license" //保留注释的情况 all，license，function，some
        }))
        .pipe(gulp.dest('dist/static/hr/recruit/js'));
});


//压缩css
//给css文件里引用url加版本号（根据引用文件的md5生产版本号），像这样：.test{background:url(../images/aa.png?v=DFhhsdfaHVKSHDFHDIHDF)}
gulp.task('recruit_cssmin', function () {
   gulp.src(['static/recruit/{css,js}/**/*.css','!static/recruit/{css,js}/**/*.min.css']) // 要压缩的css文件
       .pipe(cssver({useDate:true,format:"yyyyMMddhhmmssS"})) //给css文件里引用文件加版本号（文件MD5）
       .pipe(minCss({
           advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
           compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
           keepBreaks: false //类型：Boolean 默认：false [是否保留换行]
       })) //压缩css
       .pipe(gulp.dest('dist/static/hr/recruit'));
});

//压缩图片文件
gulp.task('recruit_imagemin', function () {
    gulp.src('./static/recruit/**/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('./dist/static/hr/recruit'));
});

//文件内容题换
gulp.task("recruit_replace", function () {
    var oDate = new Date();
    var sDate = oDate.getFullYear() +""+ (oDate.getMonth() +1) +""+ oDate.getDate() +""+ oDate.getHours() +""+ oDate.getMinutes() +""+ oDate.getSeconds() +""+ oDate.getMilliseconds();
    gulp.src('views/recruit/index.html')
        .pipe(replace(/_VERSION_/gi, sDate))
        .pipe(replace(/http:\/\/192.168.1.152\/static\/common/gi, "${ctx}/<%=jsdir%>/common"))
        .pipe(gulp.dest('dist/views/hr_daydao_com/views/recruit'));
});

//拷贝未处理的文件，包括图片文件、已经压缩的js文件、html文件，日历组件的语言包文件
gulp.task('recruit_copy', function(){
    gulp.src(['static/recruit/**/*.html','static/recruit/**/*.min.js','static/recruit/**/*.min.css','static/recruit/**/zh-cn.js']).pipe(gulp.dest('dist/static/hr/recruit'));
});


gulp.task("clean", function () {
    return gulp.src('./dist')
        .pipe(clean());
})

gulp.task('zip', function () {
    return gulp.src('./dist/**/*.*')
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('zip'));

})

//检测代码
gulp.task("sonarqube",function(callback){
    sonarqubeScanner({
        serverUrl : "http://sonar.daydao.com",
        options:{
            "sonar.projectName":"daydao-fed-hr-recruit", //你们自己的项目名称（字符串型）,
            "sonar.projectBaseDir": "./static/",
            "sonar.sources":".",
            "sonar.sourceEncoding":"UTF-8",
            "sonar.language":"js",
            "sonar.scm.disabled":"true"
        }
    }, callback);
});


gulp.task('default_build', [
    'recruit_copyfull'
    ,'recruit_jsmin'
    ,'recruit_cssmin'
    ,'recruit_imagemin'
    ,'recruit_replace'
    ,'recruit_copy'

]);  //批量执行









