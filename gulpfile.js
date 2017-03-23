const gulp = require('gulp');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const FakeS3 = require('s3rver');
const sequence = require('gulp-sequence')

const src = {
	root: './src',
	all: `./src/**/*`,
	serverless: './dist/func'
}

gulp.task('default', ['build-dev', 'fake-s3', 'build-watch']);

gulp.task('build-watch', () => {
	gulp.watch(src.all, ['hot-regen']);	
})

gulp.task('hot-regen', (done) => {
	sequence('build-dev', 'serverless-offline', 'generate-site')(done)
})

gulp.task('generate-site', done => {
	console.log('generating site')
	exec('curl localhost:3000/users/create', {}, (error, stdout, stderr) => {
		console.log(stdout)
		done()
	})
})

let serverlessOffline

gulp.task('serverless-offline', done => {
	if (serverlessOffline) {
		serverlessOffline.kill()
	}
	serverlessOffline = spawn('serverless', ['offline'], {cwd: src.serverless})
	serverlessOffline.stdout.on('data', data => {
		console.log(data.toString())
		if (data.toString().indexOf('Serverless: Offline listening on') > -1) {
			done()
		}
	})
})

gulp.task('build-dev', (done) => {
	console.log('running webpack...')
	exec('webpack', {}, (error, stdout, stderr) => {
		console.log(stdout)
		console.log('finished webpack')
		done()
	});
});

gulp.task('fake-s3', (done) => {
	let client = new FakeS3({
		port: 4569,
		hostname: 'localhost',
		silent: false,
		directory: './dev/fake_s3',
		indexDocument: 'index.html'
	}).run((err, host, port) => {
		done()
	});
})
