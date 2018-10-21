/**
 * gulp插件引入
 * */
var gulp = require('gulp'); //gulp工具
var zip = require('gulp-zip');
var clean = require('gulp-clean');
var sonarqubeScanner = require('sonarqube-scanner'); //代码质量检测

//打zip包
gulp.task('zip', function() {
    return gulp.src('../dist/**/*.*')
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('../zip'));
});


//检测代码
gulp.task("sonarqube", function (callback) {
    sonarqubeScanner({
        serverUrl: "http://sonar.daydao.com",
        options: {
            "sonar.projectName": "daydao-fed-oa-report",
            "sonar.projectBaseDir": "../src/",
            "sonar.sources": ".",
            "sonar.sourceEncoding": "UTF-8",
            "sonar.language": "js",
            "sonar.scm.disabled": "true"
        }
    }, callback);
});
