import requests
import json
import sys

BASE = 'http://localhost:5000'

def test_run(name, lang_id, code, stdin='', expected_status='Accepted'):
    payload = {'language_id': lang_id, 'source_code': code, 'stdin': stdin}
    try:
        res = requests.post(f'{BASE}/api/run', json=payload, timeout=20)
        data = res.json()
        res_data = data.get('result', data)
        status = res_data.get('status')
        stdout = res_data.get('stdout', '')
        stderr = res_data.get('stderr', '')
        comp = res_data.get('compile_output', '')
        print(f"[{name}] -> Status: {status} | Stdout: {repr(stdout[:30])} | Stderr: {repr(stderr[:30])}")
        if status != expected_status:
            print(f"  [FAIL] Expected {expected_status}, got {status}. Full response: {data}")
            return False
        return True
    except Exception as e:
        print(f"  [ERROR] {name}: {e}")
        return False

def main():
    print("Testing API Health and Judge0 Status...")
    h = requests.get(f'{BASE}/api/health').json()
    j = requests.get(f'{BASE}/api/judge0/status').json()
    print("Health:", h)
    print("Judge0 Status:", j)

    results = []
    # 1. Python Hello World
    results.append(test_run('1. Python Hello World', 71, 'print("Hello, World!")'))
    # 2. Python custom stdin
    results.append(test_run('2. Python custom stdin', 71, 'x = input()\nprint(f"Hello, {x}!")', 'Shiva'))
    # 3. Python multiline stdin
    results.append(test_run('3. Python multiline stdin', 71, 'a = input()\nb = input()\nc = input()\nprint(f"{a}-{b}-{c}")', 'Shiva\n20\nHyderabad'))
    # 4. Python runtime error
    results.append(test_run('4. Python runtime error', 71, 'x = 1 / 0', expected_status='Runtime Error (NZEC)'))
    # 5. Python syntax error
    results.append(test_run('5. Python syntax error', 71, 'def foo(:', expected_status='Runtime Error (NZEC)'))
    # 6. C Hello World
    results.append(test_run('6. C Hello World', 50, '#include <stdio.h>\nint main() { printf("Hello, World!"); return 0; }'))
    # 7. C custom stdin
    results.append(test_run('7. C custom stdin', 50, '#include <stdio.h>\nint main() { int x; scanf("%d", &x); printf("Num: %d", x * 2); return 0; }', '42'))
    # 8. C compilation error
    results.append(test_run('8. C compilation error', 50, '#include <stdio.h>\nint main() { undeclared_var = 10; return 0; }', expected_status='Compilation Error'))
    # 9. C++ Hello World
    results.append(test_run('9. C++ Hello World', 54, '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello, World!"; return 0; }'))
    # 10. C++ custom stdin
    results.append(test_run('10. C++ custom stdin', 54, '#include <iostream>\n#include <string>\nusing namespace std;\nint main() { string s; cin >> s; cout << "Hi " << s; return 0; }', 'CodeSphere'))
    # 11. Java Hello World
    results.append(test_run('11. Java Hello World', 62, 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }'))
    # 12. Java custom stdin
    results.append(test_run('12. Java custom stdin', 62, 'import java.util.Scanner;\npublic class Main { public static void main(String[] args) { Scanner sc = new Scanner(System.in); System.out.println("Java: " + sc.nextLine()); } }', 'Antigravity'))
    # 13. Java compilation error
    results.append(test_run('13. Java compilation error', 62, 'public class Main { invalid java syntax }', expected_status='Compilation Error'))
    # 14. Java runtime error
    results.append(test_run('14. Java runtime error', 62, 'public class Main { public static void main(String[] args) { int[] arr = new int[2]; System.out.println(arr[5]); } }', expected_status='Runtime Error (NZEC)'))

    passed = sum(results)
    total = len(results)
    print(f"\nCompleted: {passed}/{total} tests passed.")
    if passed != total:
        sys.exit(1)

if __name__ == '__main__':
    main()
