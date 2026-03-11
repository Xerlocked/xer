---
title: "C++ 가상 함수 테이블"
summary: "C++의 가상 함수 테이블에 대해 알아봅니다."
date: "Sep 12 2025"
draft: false
tags:
- Dev
---

# 들어가며

오늘은 개념을 리마인드하자는 의미에서 C++에 관한 이야기를 해보겠습니다. 제목에 적혀있다시피 가상 함수에 대한 이야기입니다.

---

## 1. 다형성(Polymorphism)의 시작

우리가 객체지향 이라고 부르는 프로그래밍 패러다임 이전에는 코드를 어떻게 작성했는지 아시나요?

만약 캐릭터의 무기 종류에 따라 데미지 산출이 다르다면 다음과 같이 코드를 작성해야합니다.

```cpp
void CalculateSwordDamage(float Damage);
void CalculateStaffDamage(float Damage, MagicType Type);
```
새로운 타입의 무기가 추가되면, 새로운 함수를 또 만들어야 했죠. 이 방식은 기능이 추가될 때마다 코드를 계속해서 수정하고 확장해야 하므로 매우 비효율적입니다.

그래서 다형성(Polymorphism)이란 개념이 등장했습니다. 이건 하나의 인터페이스나 타입으로 여러 다른 형태의 객체를 다룰 수 있는 능력을 말합니다. 

앞 선 무기를 생각해볼까요? 모두 '공격'이라는 공통적인 기능을 가지고 있습니다. 이럴 때 모든 무기를 Weapon 이라는 하나의 부모 클래스로 묶고 각 무기별 특성에 맞는 공격 방식을 구현하면, 각기 다른 무기를 동일한 방식으로 다룰 수 있게 됩니다.

## 2. 가상함수와 오버라이딩

다형성을 구현하기 위한 가장 대표적인 방법이 바로 `가상 함수` 입니다. 가상 함수는 부모 클래스에 `virtual` 키워드를 붙여 선언하고, 자식 클래스에서 이를 재정의(override)하여 사용합니다.


```cpp Weapon
class Weapon
{
public:
    Weapon() { Damage = 1.0f; }
    virtual ~Weapon() = default;
    
    virtual double GetWeaponDamage()
    {
        return Damage * 1.0f;
    }

protected:
    double Damage;
};
```

위 코드에서 `Weapon` 클래스의 GetWeaponDamage() 함수는 virtual 키워드가 붙어있습니다. 이제 이 클래스를 상속받는 Sword 클래스를 볼까요?

```cpp Sword
class Sword : public Weapon
{
public:
    Sword() { Damage = 2.0f; }

    virtual double GetWeaponDamage() override
    {
        return Damage * 2.5f;
    }
};
```
`Sword` 클래스 GetWeaponDamage() 함수를 override 키워드와 함께 재정의했습니다. 이제 Sword 클래스의 GetWeaponDamage() 함수를 호출하면 Damage의 2.5배의 값이 반환됩니다.

## 3. C++ 컴파일러는 어떻게 가상 함수를 호출할까?

일반적인 함수 호출은 컴파일러에 의해 런타임 상황에선 이미 함수의 주소를 알고 있습니다. 이를 __정적 바인딩(Static Binding)__ 이라고 합니다. 하지만 가상 함수는 어떨까요? 만약 무기 클래스를 new 통해 새로 생성한다고 하면, 컴파일 시점에서는 `Weapon` 을 가리킬지, `Sword`를 가리킬지 알 수 없습니다. 그렇기 때문에 가상 함수는 런타임에 어떤 클래스에서 함수를 호출할지 결정하게 됩니다. 이를 __동적 바인딩(Dynamic Binding)__ 이라고 합니다.

그렇다면 컴파일러는 어떻게 런타임에 올바른 함수를 찾아올까요? 바로 __가상 함수 테이블(Virtual Function Table)__ 과 __가상 함수 테이블 포인터(Virtual Function Table Pointer)__ 를 이용합니다.

## 4. 가상 함수 테이블(V-Table)의 비밀

```cpp main
signed main()
{
    Weapon* BaseWeapon = new Weapon;
    Sword* WeaponSword = new Sword;

    BaseWeapon.GetWeaponDamage();
    WeaponSword.GetWeaponDamage();

    delete BaseWeapon;
    delete WeaponSword;

    return 0;
}
```
위 코드는 앞 선 클래스를 생성하고 함수를 호출하고 있는 코드입니다. 이때 컴파일러는 가상 함수를 포함하는 클래스를 만나면, 해당 클래스의 모든 가상 함수의 주소를 담고 있는 가상 함수 테이블(V-Table) 을 생성합니다. 그리고 각 객체의 맨 앞에는 이 테이블을 가리키는 포인터, 즉 V-Pointer를 숨겨놓습니다.

위 코드의 실행 결과의 주소들을 출력해보았습니다.

```text
Weapon 객체의 주소: 000000000013f500
가상함수 테이블의 주소: 00007ff7afc49a60
GetWeaponDamage 함수의 주소: 00007ff7afc47d30
--------------------------------
Sword 객체의 주소: 000000000012fdc0
가상함수 테이블의 주소: 00007ff7afc49a30
GetWeaponDamage 함수의 주소: 00007ff7afc47c50
```

결과에서 볼 수 있듯이, `Weapon` 객체와 `Sword` 객체는 각기 다른 주소의 V-Table을 가리키고 있습니다.(49a60 / 49a30)

각 V-Table에는 가상 함수 `GetWeaponDamage()`가 있는데요, 이 역시 다른 주소를 기리키고 있습니다. (47d30 / 47c50)

따라서 GetWeaponDamage()와 같이 가상 함수를 호출할 때, 컴파일러는 먼저 객체 내부의 V-Pointer를 찾아 V-Table로 이동하고, 거기서 올바른 함수의 주소를 찾아 호출하게 됩니다.

---

# 마무리

오늘은 컴파일러가 가상 함수를 처리하는 방법에 대해 정리해보았습니다. 거의 모든 언어와 컴파일러에서 이와 비슷한 방식을 채택하고 있기 때문에 꼭 한 번 살펴보시면 좋겠습니다. 감사합니다.