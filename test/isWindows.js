if (typeof process !== 'undefined' && process.platform === 'win32') {
    expect(isWindows).to.be.true;
} else {
    expect(isWindows).to.be.a('boolean');
}
