// Language starter templates and metadata
const LANGUAGE_CONFIGS = {
  '71': {
    name: 'Python',
    version: '3.8.1',
    ext: '.py',
    filename: 'main.py',
    icon: '🐍',
    template: `print("Hello, World!")\n`
  },
  '50': {
    name: 'C',
    version: 'GCC 9.2.0',
    ext: '.c',
    filename: 'main.c',
    icon: '🇨',
    template: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`
  },
  '54': {
    name: 'C++',
    version: 'GCC 9.2.0',
    ext: '.cpp',
    filename: 'main.cpp',
    icon: '⚙️',
    template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`
  },
  '62': {
    name: 'Java',
    version: 'OpenJDK 13.0.1',
    ext: '.java',
    filename: 'Main.java',
    icon: '☕',
    template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`
  }
};
