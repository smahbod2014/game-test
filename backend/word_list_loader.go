package main

import (
	"bufio"
	"log"
	"os"
	"strings"
)

func LoadWordListFromFile(fileName string) ([]string, error) {
	f, err := os.Open(fileName)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)

	var words []string
	for scanner.Scan() {
		words = append(words, strings.ToUpper(scanner.Text()))
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
		return nil, err
	}

	return words, nil
}