package main

import (
	"errors"
	"fmt"
	"os/exec"
	"path"
)

type Unit struct{}

var unit Unit

type App struct {
	id, store, region, ver string
}

func apkPath(app App) string {
	return path.Join(cfg.AppDir, app.id, app.store, app.region, app.ver)
}

func outDir(app App) string {
	return path.Join(cfg.UnpackDir, app.id, app.store, app.region, app.ver)
}

func unpack(app App) error {
	cmd := exec.Command("apktool", "d", apkPath(app), "-o", outDir(app))
	out, err := cmd.CombinedOutput()
	if err != nil {
		return errors.New(fmt.Sprintf("Error '%s' unpacking apk; output below:\n%s",
			err.Error(), string(out)))
	}
	return nil
}

func combine(a, b map[string]Unit) map[string]Unit {
	ret := a
	for e, _ := range b {
		ret[e] = unit
	}
	return ret
}

func strmap(args ...string) map[string]Unit {
	ret := make(map[string]Unit)
	for _, e := range args {
		ret[e] = unit
	}

	return ret
}